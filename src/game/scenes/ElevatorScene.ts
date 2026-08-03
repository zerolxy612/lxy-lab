import Phaser from 'phaser'
import { PLAYER_FRAMES, PLAYER_SHEET_KEY } from '../art/playerArt'
import { ROOM_BACKGROUND_TEXTURE_KEY } from '../art/roomBackgroundArt'
import { labBridge } from '../bridge'
import { LAB_HEIGHT, LAB_WIDTH } from '../dimensions'
import { ElevatorCabin } from '../entities/ElevatorCabin'
import {
  ELEVATOR_ARRIVAL_MS,
  ELEVATOR_DOORS_OPEN_MS,
  ELEVATOR_FLOORS,
  ELEVATOR_SEQUENCE_MS,
} from '../elevatorSequence'

const centerX = LAB_WIDTH / 2
const centerY = LAB_HEIGHT / 2

export class ElevatorScene extends Phaser.Scene {
  private sequenceStarted = false
  private cabin!: ElevatorCabin
  private floorDisplay!: Phaser.GameObjects.Text
  private floorCaption!: Phaser.GameObjects.Text
  private directionStatus!: Phaser.GameObjects.Text
  private accessStatus!: Phaser.GameObjects.Text
  private systemText!: Phaser.GameObjects.Text
  private arrivalText!: Phaser.GameObjects.Text
  private blackout!: Phaser.GameObjects.Rectangle
  private labPreview!: Phaser.GameObjects.Image
  private labVeil!: Phaser.GameObjects.Rectangle
  private transitionGlow!: Phaser.GameObjects.Rectangle
  private passenger!: Phaser.GameObjects.Sprite
  private passengerShadow!: Phaser.GameObjects.Ellipse
  private passengerContainer!: Phaser.GameObjects.Container
  private readonly floorLamps: Phaser.GameObjects.Rectangle[] = []
  private readonly interfaceChrome: Phaser.GameObjects.GameObject[] = []
  private readonly particles: Phaser.GameObjects.Rectangle[] = []
  private readonly motionStreaks: Phaser.GameObjects.Rectangle[] = []
  private removeStartListener?: () => void
  private removeSkipListener?: () => void

  constructor() {
    super('elevator')
  }

  create() {
    this.cameras.main.setBackgroundColor('#02050a')
    this.drawLabThreshold()
    this.cabin = new ElevatorCabin(this)
    this.drawPassenger()
    this.drawInterface()
    this.drawAtmosphere()

    this.removeStartListener = labBridge.on('ui:elevator-start', () => this.startSequence())
    this.removeSkipListener = labBridge.on('ui:elevator-skip', () => this.finish())
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.removeStartListener?.()
      this.removeSkipListener?.()
    })

    labBridge.emit('game:loading', { phase: 'ready', progress: 1 })
    labBridge.emit('game:entrance-ready', {})
  }

  private drawLabThreshold() {
    this.labPreview = this.add.image(centerX, centerY, ROOM_BACKGROUND_TEXTURE_KEY)
      .setAlpha(0.32)
      .setTint(0x6dbedf)
      .setDepth(0)
    this.labVeil = this.add.rectangle(centerX, centerY, LAB_WIDTH, LAB_HEIGHT, 0x02050c, 0.78)
      .setDepth(1)
  }

  private drawPassenger() {
    const floorGlow = this.add.ellipse(0, 36, 42, 12, 0x5cdfff, 0.09)
    this.passengerShadow = this.add.ellipse(0, 35, 31, 8, 0x01030a, 0.7)
    this.passenger = this.add.sprite(0, 0, PLAYER_SHEET_KEY, PLAYER_FRAMES.up.idle)
      .setScale(1.8)

    this.passengerContainer = this.add.container(centerX, 442, [
      floorGlow,
      this.passengerShadow,
      this.passenger,
    ]).setDepth(6)
  }

  private drawInterface() {
    const floorFrame = this.add.container(centerX, 76).setDepth(8)
    floorFrame.add(this.add.rectangle(0, 0, 190, 56, 0x030812, 0.9)
      .setStrokeStyle(1, 0x5cdfff, 0.34))
    floorFrame.add(this.add.rectangle(-62, -27, 48, 2, 0xffc45c, 0.85))
    floorFrame.add(this.add.rectangle(50, -27, 72, 2, 0x5cdfff, 0.5))
    this.floorDisplay = this.add.text(-54, 1, 'B1', {
      color: '#aaf3ff',
      fontFamily: 'sans-serif',
      fontSize: '31px',
      fontStyle: 'bold',
      letterSpacing: 4,
    }).setOrigin(0.5)
    this.floorCaption = this.add.text(27, -8, 'SUBLEVEL', {
      color: '#6f82a4',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0.5)
    this.directionStatus = this.add.text(27, 9, 'STANDBY', {
      color: '#ffc45c',
      fontFamily: 'sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0.5)
    floorFrame.add([this.floorDisplay, this.floorCaption, this.directionStatus])

    const accessNode = this.add.container(130, 238).setDepth(7)
    accessNode.add(this.add.rectangle(0, 0, 94, 76, 0x020711, 0.72)
      .setStrokeStyle(1, 0x5cdfff, 0.25))
    accessNode.add(this.add.rectangle(-37, -27, 8, 3, 0x5cdfff, 0.9))
    accessNode.add(this.add.text(-28, -28, 'ACCESS / 07', {
      color: '#7deaff',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      letterSpacing: 1,
    }).setOrigin(0, 0.5))
    this.accessStatus = this.add.text(-37, -7, 'IDENTITY VERIFIED\nLIFT READY', {
      color: '#7e90b2',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      letterSpacing: 1,
      lineSpacing: 5,
    }).setOrigin(0, 0)
    accessNode.add(this.accessStatus)

    const floorRail = this.add.container(818, 276).setDepth(7)
    floorRail.add(this.add.text(0, -82, 'B / LEVEL', {
      color: '#7183a5',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      letterSpacing: 1,
    }).setOrigin(0.5))
    for (let index = 0; index < ELEVATOR_FLOORS.length; index += 1) {
      const y = -58 + index * 20
      const lamp = this.add.rectangle(-16, y, 5, 5, 0x5cdfff, index === 0 ? 0.9 : 0.16)
      this.floorLamps.push(lamp)
      floorRail.add(lamp)
      floorRail.add(this.add.text(-5, y, ELEVATOR_FLOORS[index], {
        color: '#7e8dab',
        fontFamily: 'sans-serif',
        fontSize: '7px',
      }).setOrigin(0, 0.5))
    }

    this.systemText = this.add.text(centerX, 196, '', {
      align: 'center',
      color: '#b7f6ff',
      fontFamily: 'sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      letterSpacing: 3,
      lineSpacing: 12,
    }).setOrigin(0.5).setDepth(101)

    this.arrivalText = this.add.text(centerX, 210, '', {
      align: 'center',
      color: '#e7faff',
      fontFamily: 'sans-serif',
      fontSize: '23px',
      fontStyle: 'bold',
      letterSpacing: 7,
      lineSpacing: 12,
    }).setOrigin(0.5).setDepth(12)

    this.blackout = this.add.rectangle(centerX, centerY, LAB_WIDTH, LAB_HEIGHT, 0x010309)
      .setAlpha(0)
      .setDepth(100)
    this.transitionGlow = this.add.rectangle(centerX, centerY, LAB_WIDTH, LAB_HEIGHT, 0xa8efff)
      .setAlpha(0)
      .setDepth(90)
      .setBlendMode(Phaser.BlendModes.ADD)

    this.interfaceChrome.push(floorFrame, accessNode, floorRail)
  }

  private drawAtmosphere() {
    const scanlines = this.add.graphics().setDepth(9).setAlpha(0.18)
    scanlines.lineStyle(1, 0x74cde5, 0.08)
    for (let y = 2; y < LAB_HEIGHT; y += 4) scanlines.lineBetween(0, y, LAB_WIDTH, y)
    this.interfaceChrome.push(scanlines)

    for (let index = 0; index < 12; index += 1) {
      const x = 88 + ((index * 83) % 780)
      const y = 132 + ((index * 53) % 300)
      const particle = this.add.rectangle(x, y, index % 4 === 0 ? 2 : 1, 1, 0x9deeff, 0.2)
        .setDepth(5)
      this.particles.push(particle)
      this.tweens.add({
        targets: particle,
        y: y - 24 - (index % 3) * 9,
        alpha: 0.02,
        duration: 2_200 + (index % 4) * 310,
        delay: index * 130,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    for (let index = 0; index < 8; index += 1) {
      const side = index % 2 === 0 ? 1 : -1
      const streak = this.add.rectangle(
        centerX + side * (350 + (index % 3) * 34),
        96 + index * 49,
        2,
        36 + (index % 3) * 16,
        0x5cdfff,
        0,
      ).setDepth(7)
      this.motionStreaks.push(streak)
    }
  }

  private startSequence() {
    if (this.sequenceStarted) return
    this.sequenceStarted = true

    this.tweens.chain({
      targets: this.blackout,
      tweens: [
        { alpha: 1, duration: 240, ease: 'Quart.easeOut' },
        { alpha: 1, duration: 520 },
        { alpha: 0, duration: 240, ease: 'Expo.easeOut' },
      ],
    })
    this.typeSystemMessage()

    this.time.delayedCall(1_000, () => {
      this.directionStatus.setText('DESCENDING').setColor('#8ff1ff')
      this.cameras.main.shake(2_650, 0.00125, false)
      this.tweens.add({
        targets: this.cabin.motionTargets,
        y: 3,
        duration: 105,
        yoyo: true,
        repeat: 11,
        ease: 'Sine.easeInOut',
      })
      this.tweens.add({
        targets: this.cabin.ceilingLight,
        alpha: 0.36,
        duration: 85,
        yoyo: true,
        repeat: 8,
        repeatDelay: 140,
      })
      this.tweens.add({
        targets: this.passengerContainer,
        y: 445,
        duration: 120,
        yoyo: true,
        repeat: 10,
        ease: 'Sine.easeInOut',
      })
      this.tweens.add({
        targets: this.passengerShadow,
        scaleX: 1.1,
        duration: 120,
        yoyo: true,
        repeat: 10,
        ease: 'Sine.easeInOut',
      })
      this.motionStreaks.forEach((streak, index) => {
        this.tweens.add({
          targets: streak,
          y: streak.y + 112,
          alpha: { from: 0, to: 0.22 },
          duration: 440 + index * 24,
          delay: index * 50,
          repeat: 4,
          ease: 'Quad.easeIn',
        })
      })
    })

    ELEVATOR_FLOORS.forEach((floor, index) => {
      this.time.delayedCall(1_050 + index * 390, () => this.setFloor(floor, index))
    })

    this.time.delayedCall(ELEVATOR_ARRIVAL_MS, () => this.arrive())
    this.time.delayedCall(ELEVATOR_DOORS_OPEN_MS, () => this.openDoors())
    this.time.delayedCall(ELEVATOR_SEQUENCE_MS, () => this.finish())
  }

  private typeSystemMessage() {
    const message = 'CONNECTING TO LXY LAB...\n\nIDENTITY VERIFIED\n\nACCESS GRANTED'
    let cursor = 0
    const timer = this.time.addEvent({
      delay: 15,
      repeat: message.length - 1,
      callback: () => {
        cursor += 1
        this.systemText.setText(message.slice(0, cursor))
        this.systemText.setX(centerX + (cursor % 11 === 0 ? 2 : 0))
        if (cursor === message.length) {
          this.systemText.setX(centerX)
          this.tweens.add({
            targets: this.systemText,
            alpha: 0,
            delay: 130,
            duration: 160,
            ease: 'Quart.easeOut',
          })
        }
      },
    })
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => timer.remove())
  }

  private arrive() {
    this.cameras.main.shake(180, 0.0045, false)
    this.setFloor('B7', ELEVATOR_FLOORS.length - 1)
    this.floorDisplay.setColor('#ffd172')
    this.floorCaption.setText('LAB LEVEL')
    this.directionStatus.setText('LOCKED').setColor('#ffc45c')
    this.accessStatus.setText('ACCESS GRANTED\nDOOR RELEASED').setColor('#ffc45c')
    this.arrivalText.setText('ARRIVAL\nLXY AI LAB').setAlpha(0).setScale(0.97)
    this.tweens.add({
      targets: this.arrivalText,
      alpha: 1,
      scale: 1,
      duration: 320,
      ease: 'Expo.easeOut',
    })
    this.tweens.chain({
      targets: this.passengerContainer,
      tweens: [
        { y: 449, duration: 85, ease: 'Quart.easeIn' },
        { y: 442, duration: 210, ease: 'Quint.easeOut' },
      ],
    })
    this.tweens.chain({
      targets: this.passengerShadow,
      tweens: [
        { scaleX: 1.2, scaleY: 0.84, duration: 85, ease: 'Quart.easeIn' },
        { scaleX: 1, scaleY: 1, duration: 210, ease: 'Quint.easeOut' },
      ],
    })
    this.events.emit('elevator:ding')
  }

  private openDoors() {
    this.labPreview.clearTint()
    this.cabin.openDoors(870)
    this.tweens.add({
      targets: this.arrivalText,
      alpha: 0,
      duration: 220,
      ease: 'Quart.easeOut',
    })
    this.tweens.add({
      targets: this.labPreview,
      alpha: 1,
      duration: 860,
      ease: 'Quint.easeInOut',
    })
    this.tweens.add({
      targets: this.labVeil,
      alpha: 0,
      duration: 720,
      ease: 'Quint.easeInOut',
    })
    this.tweens.add({
      targets: [...this.interfaceChrome, ...this.particles, ...this.motionStreaks],
      alpha: 0,
      duration: 300,
      ease: 'Quart.easeOut',
    })
    this.tweens.add({
      targets: this.cabin.fadeTargets,
      alpha: 0,
      delay: 650,
      duration: 380,
      ease: 'Quart.easeIn',
    })
    this.tweens.add({
      targets: this.transitionGlow,
      alpha: 0.88,
      delay: 650,
      duration: 430,
      ease: 'Quart.easeIn',
    })

    this.time.delayedCall(245, () => this.passenger.setFrame(PLAYER_FRAMES.up.walk))
    this.time.delayedCall(420, () => this.passenger.setFrame(PLAYER_FRAMES.up.idle))
    this.time.delayedCall(565, () => this.passenger.setFrame(PLAYER_FRAMES.up.walk))
    this.time.delayedCall(735, () => this.passenger.setFrame(PLAYER_FRAMES.up.idle))
    this.tweens.add({
      targets: this.passengerContainer,
      y: 408,
      scale: 0.92,
      delay: 245,
      duration: 600,
      ease: 'Sine.easeInOut',
    })
    this.tweens.add({
      targets: this.passengerShadow,
      alpha: 0.22,
      delay: 245,
      duration: 600,
      ease: 'Sine.easeIn',
    })
  }

  private finish() {
    this.scene.start('lab', { entranceReveal: this.sequenceStarted })
  }

  private setFloor(floor: (typeof ELEVATOR_FLOORS)[number], activeIndex: number) {
    this.floorDisplay.setText(floor).setScale(1.1)
    this.accessStatus.setText(`TRANSIT ACTIVE\nROUTE ${floor}`)
    this.tweens.add({
      targets: this.floorDisplay,
      scale: 1,
      duration: 180,
      ease: 'Expo.easeOut',
    })
    this.floorLamps.forEach((lamp, index) => {
      lamp.setFillStyle(index === activeIndex ? 0xffc45c : 0x5cdfff, index === activeIndex ? 0.95 : 0.16)
    })
  }
}
