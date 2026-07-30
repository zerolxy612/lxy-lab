type AudioContextConstructor = new (options?: AudioContextOptions) => AudioContext

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === 'undefined') return undefined

  const audioWindow = window as Window & {
    webkitAudioContext?: AudioContextConstructor
  }
  return window.AudioContext ?? audioWindow.webkitAudioContext
}

export function isRoomAmbienceSupported() {
  return getAudioContextConstructor() !== undefined
}

export class RoomAmbienceEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private pulseInterval: number | null = null
  private firstPulseTimer: number | null = null

  async start() {
    if (this.context && this.context.state !== 'closed') {
      await this.context.resume()
      return
    }

    const AudioContextClass = getAudioContextConstructor()
    if (!AudioContextClass) throw new Error('Web Audio is unavailable')

    const context = new AudioContextClass({ latencyHint: 'playback' })
    const master = context.createGain()
    master.gain.setValueAtTime(0, context.currentTime)
    master.connect(context.destination)

    this.context = context
    this.master = master
    this.createRainLayer(context, master)
    this.createMachineHum(context, master)

    await this.resumeWithTimeout(context)
    master.gain.linearRampToValueAtTime(0.18, context.currentTime + 0.8)

    this.firstPulseTimer = window.setTimeout(() => this.playSystemPulse(), 3_800)
    this.pulseInterval = window.setInterval(() => this.playSystemPulse(), 11_500)
  }

  async suspend() {
    if (this.context?.state !== 'running') return

    try {
      await this.context.suspend()
    } catch {
      // The page may have closed the context during a visibility transition.
    }
  }

  async resume() {
    if (this.context?.state !== 'suspended') return

    try {
      await this.context.resume()
    } catch {
      // A browser may require another trusted gesture after a long suspension.
    }
  }

  async stop() {
    if (this.firstPulseTimer !== null) window.clearTimeout(this.firstPulseTimer)
    if (this.pulseInterval !== null) window.clearInterval(this.pulseInterval)
    this.firstPulseTimer = null
    this.pulseInterval = null

    const context = this.context
    const master = this.master
    this.context = null
    this.master = null
    if (!context || context.state === 'closed') return

    if (master) {
      const now = context.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setTargetAtTime(0, now, 0.06)
    }

    await new Promise((resolve) => window.setTimeout(resolve, 220))
    try {
      await context.close()
    } catch {
      // A concurrent teardown may already have closed this detached context.
    }
  }

  private createRainLayer(context: AudioContext, destination: AudioNode) {
    const seconds = 5
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate)
    const channel = buffer.getChannelData(0)
    let drift = 0

    for (let index = 0; index < channel.length; index += 1) {
      drift = drift * 0.985 + (Math.random() * 2 - 1) * 0.15
      channel[index] = Math.max(-1, Math.min(1, drift + (Math.random() * 2 - 1) * 0.42))
    }

    const source = context.createBufferSource()
    const highPass = context.createBiquadFilter()
    const lowPass = context.createBiquadFilter()
    const rainGain = context.createGain()

    source.buffer = buffer
    source.loop = true
    highPass.type = 'highpass'
    highPass.frequency.value = 520
    lowPass.type = 'lowpass'
    lowPass.frequency.value = 5_800
    rainGain.gain.value = 0.105

    source.connect(highPass).connect(lowPass).connect(rainGain).connect(destination)
    source.start()
  }

  private createMachineHum(context: AudioContext, destination: AudioNode) {
    const humFilter = context.createBiquadFilter()
    const humGain = context.createGain()
    const fundamental = context.createOscillator()
    const harmonic = context.createOscillator()
    const modulation = context.createOscillator()
    const modulationDepth = context.createGain()

    humFilter.type = 'lowpass'
    humFilter.frequency.value = 190
    humGain.gain.value = 0.038
    fundamental.type = 'sine'
    fundamental.frequency.value = 52
    harmonic.type = 'triangle'
    harmonic.frequency.value = 104
    modulation.type = 'sine'
    modulation.frequency.value = 0.08
    modulationDepth.gain.value = 0.006

    fundamental.connect(humFilter)
    harmonic.connect(humFilter)
    humFilter.connect(humGain).connect(destination)
    modulation.connect(modulationDepth).connect(humGain.gain)

    fundamental.start()
    harmonic.start()
    modulation.start()
  }

  private playSystemPulse() {
    const context = this.context
    const destination = this.master
    if (!context || !destination || context.state !== 'running') return

    const now = context.currentTime
    const oscillator = context.createOscillator()
    const pulseGain = context.createGain()
    const toneFilter = context.createBiquadFilter()
    const panner = context.createStereoPanner()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(620, now)
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.12)
    toneFilter.type = 'bandpass'
    toneFilter.frequency.value = 760
    toneFilter.Q.value = 1.8
    pulseGain.gain.setValueAtTime(0.0001, now)
    pulseGain.gain.exponentialRampToValueAtTime(0.036, now + 0.025)
    pulseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)
    panner.pan.value = Math.random() * 1.2 - 0.6

    oscillator.connect(toneFilter).connect(pulseGain).connect(panner).connect(destination)
    oscillator.start(now)
    oscillator.stop(now + 0.26)
  }

  private async resumeWithTimeout(context: AudioContext) {
    let timeout = 0
    const timedOut = new Promise<never>((_, reject) => {
      timeout = window.setTimeout(() => reject(new Error('Audio start timed out')), 1_500)
    })

    try {
      await Promise.race([context.resume(), timedOut])
    } finally {
      window.clearTimeout(timeout)
    }

    if (context.state !== 'running') throw new Error('Audio playback is suspended')
  }
}
