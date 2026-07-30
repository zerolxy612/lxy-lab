import Phaser from 'phaser'
import type { StationId } from '../../content/stations'
import { stationById } from '../../content/stations'
import { labBridge } from '../bridge'
import { LAB_HEIGHT, LAB_WIDTH } from '../config'
import { Player } from '../entities/Player'
import {
  EXPERIENCE_ARCHIVE_ORIGIN_Y,
  EXPERIENCE_ARCHIVE_TEXTURE_KEY,
} from '../art/experienceArchiveArt'
import {
  OFFLINE_CORNER_TEXTURE_KEY,
  RAG_PIPELINE_TEXTURE_KEY,
} from '../art/environmentArt'
import {
  LIVING_CORE_ORIGIN_Y,
  LIVING_CORE_TEXTURE_KEY,
} from '../art/livingCoreArt'
import { ROOM_BACKGROUND_TEXTURE_KEY } from '../art/roomBackgroundArt'
import {
  FUTURE_GATE_TEXTURE_KEY,
  LAB_COMPANION_TEXTURE_KEY,
  SELECTED_WORK_TEXTURE_KEY,
} from '../art/stationArt'
import {
  getStationCollisionRect,
  LAB_MAP_KEY,
  parseLabMap,
  type LabLayout,
  type StationLayout,
} from '../layout/labLayout'
import {
  InteractionSystem,
  type InteractiveStation,
} from '../systems/InteractionSystem'

interface StationVisual {
  container: Phaser.GameObjects.Container
  focusFrame: Phaser.GameObjects.Rectangle
  label: Phaser.GameObjects.Text
  visitedMark: Phaser.GameObjects.Text
}

export class LabScene extends Phaser.Scene {
  private player!: Player
  private interactionSystem!: InteractionSystem
  private controlsEnabled = true
  private removePanelListener?: () => void
  private removeNearbyListener?: () => void
  private removeVisitedListener?: () => void
  private readonly stationVisuals = new Map<StationId, StationVisual>()
  private readonly visitedStations = new Set<StationId>()
  private nearbyStation: StationId | null = null
  private hoveredStation: StationId | null = null
  private activeStation: StationId | null = null
  private hasPlayerMoved = false
  private reducedMotion = false
  private debugVisible = false
  private debugKey!: Phaser.Input.Keyboard.Key
  private debugGraphics!: Phaser.GameObjects.Graphics
  private debugLabel!: Phaser.GameObjects.Text
  private ragResponsePacket?: Phaser.GameObjects.Container
  private hasAcknowledgedCoreVisit = false
  private readonly collisionDebugRects: Phaser.Geom.Rectangle[] = []
  private readonly interactionDebugRects: Phaser.Geom.Rectangle[] = []
  private layout!: LabLayout

  constructor() {
    super('lab')
  }

  create() {
    try {
      this.createLab()
    } catch (error) {
      console.error('Lab scene failed to initialise.', error)
      labBridge.emit('game:error', {
        message: 'The room layout could not be prepared.',
      })
    }
  }

  private createLab() {
    const cachedMap = this.cache.tilemap.get(LAB_MAP_KEY) as { data?: unknown } | undefined
    this.layout = parseLabMap(cachedMap?.data)
    const { worldBounds, playerSpawn, staticObstacles, stations: stationLayouts } = this.layout

    this.physics.world.setBounds(
      worldBounds.x,
      worldBounds.y,
      worldBounds.width,
      worldBounds.height,
    )
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    this.drawRoomBackdrop()
    this.drawRoomLighting()
    this.drawHongKongRain()
    this.drawFloorConduits()
    this.drawPersonalCorner()
    this.drawRagRack()

    this.player = new Player(this, playerSpawn.x, playerSpawn.y)

    staticObstacles.forEach(({ x, y, width, height }) => {
      this.createStaticBlock(x, y, width, height)
    })

    const stations = stationLayouts.map((layout) => this.createStation(layout))
    this.interactionSystem = new InteractionSystem(this, this.player, stations)
    this.createDebugOverlay()

    this.removePanelListener = labBridge.on('ui:panel-change', ({ open, stationId }) => {
      this.controlsEnabled = !open
      this.activeStation = stationId
      this.refreshAllStationStates()
    })
    this.removeNearbyListener = labBridge.on('station:nearby', ({ stationId }) => {
      this.nearbyStation = stationId
      this.refreshAllStationStates()
    })
    this.removeVisitedListener = labBridge.on('ui:visited-change', ({ visited }) => {
      this.visitedStations.clear()
      visited.forEach((id) => this.visitedStations.add(id))
      if (this.visitedStations.has('systems')) this.playRagCoreAcknowledgement()
      this.refreshAllStationStates()
    })
    labBridge.emit('game:loading', { phase: 'ready', progress: 1 })
    labBridge.emit('game:ready', {})

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.removePanelListener?.()
      this.removeNearbyListener?.()
      this.removeVisitedListener?.()
    })
  }

  update() {
    const moved = this.player.move(this.controlsEnabled)
    if (moved && !this.hasPlayerMoved) {
      this.hasPlayerMoved = true
      labBridge.emit('player:first-move', { input: 'keyboard' })
    }

    this.interactionSystem.update(this.controlsEnabled)

    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      this.debugVisible = !this.debugVisible
      this.renderDebugOverlay()
    }
  }

  private drawRoomBackdrop() {
    this.cameras.main.setBackgroundColor('#050612')

    this.add.image(LAB_WIDTH / 2, LAB_HEIGHT / 2, ROOM_BACKGROUND_TEXTURE_KEY)
      .setDepth(0)

    this.add.text(68, LAB_HEIGHT - 31, 'LAB-01 / MOVEMENT BUILD', {
      color: '#586687',
      fontFamily: 'sans-serif',
      fontSize: '9px',
      letterSpacing: 2,
    }).setDepth(3)
  }

  private drawRoomLighting() {
    const light = this.add.graphics().setDepth(1)
    light.fillStyle(0xffc45c, 0.035)
    light.fillEllipse(150, 310, 250, 260)
    light.fillStyle(0x5cdfff, 0.035)
    light.fillEllipse(480, 255, 360, 300)
    light.fillStyle(0xff7867, 0.025)
    light.fillEllipse(810, 390, 220, 250)
  }

  private drawHongKongRain() {
    const farRain = this.add.graphics().setDepth(2).setAlpha(0.24)
    const nearRain = this.add.graphics().setDepth(2).setAlpha(0.34)
    const nightTransit = this.add.container(500, 145).setDepth(2).setAlpha(0.42)
    const ferryLight = this.add.rectangle(0, 0, 4, 2, 0xffc45c, 0.9)
    const sternLight = this.add.rectangle(-7, 1, 2, 1, 0xff6b4a, 0.75)
    nightTransit.add([ferryLight, sternLight])

    farRain.lineStyle(1, 0x5c86b9, 0.7)
    for (let index = 0; index < 18; index += 1) {
      const x = 264 + index * 25
      const y = 40 + (index * 19) % 94
      farRain.lineBetween(x, y, x - 3, y + 9)
    }

    nearRain.lineStyle(1, 0x8fc8e8, 0.82)
    for (let index = 0; index < 12; index += 1) {
      const x = 276 + index * 37
      const y = 44 + (index * 23) % 86
      nearRain.lineBetween(x, y, x - 4, y + 12)
    }

    if (this.reducedMotion) return

    nightTransit.setPosition(300, 145).setAlpha(0)
    this.tweens.add({
      targets: nightTransit,
      x: 660,
      alpha: { from: 0.16, to: 0.62 },
      delay: 4200,
      duration: 12_000,
      ease: 'Linear',
      onComplete: () => nightTransit.setAlpha(0),
    })

    this.tweens.add({
      targets: farRain,
      y: { from: -6, to: 8 },
      duration: 1150,
      repeat: -1,
      ease: 'Linear',
    })
    this.tweens.add({
      targets: nearRain,
      y: { from: -8, to: 8 },
      duration: 760,
      repeat: -1,
      ease: 'Linear',
    })
  }

  private drawFloorConduits() {
    const lines = this.add.graphics().setDepth(2)
    const paths = [
      [[480, 244], [480, 272], [232, 272], [232, 210], [178, 210]],
      [[432, 224], [360, 224], [360, 302], [236, 302]],
      [[528, 224], [620, 224], [620, 305], [700, 305]],
      [[524, 244], [650, 244], [650, 430], [730, 430]],
    ]

    paths.forEach((points, index) => {
      lines.lineStyle(5, 0x07091a, 0.9)
      lines.beginPath()
      points.forEach(([x, y], pointIndex) => {
        if (pointIndex === 0) lines.moveTo(x, y)
        else lines.lineTo(x, y)
      })
      lines.strokePath()

      lines.lineStyle(2, index % 2 === 0 ? 0x5cdfff : 0x8a63ff, 0.55)
      lines.beginPath()
      points.forEach(([x, y], pointIndex) => {
        if (pointIndex === 0) lines.moveTo(x, y)
        else lines.lineTo(x, y)
      })
      lines.strokePath()
    })

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: lines,
        alpha: { from: 0.62, to: 1 },
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }
  }

  private drawPersonalCorner() {
    const container = this.add.container(194, 432).setDepth(432).setAlpha(0.98)
    const warmPool = this.add.ellipse(70, 2, 112, 64, 0xffc45c, 0.045)
      .setBlendMode(Phaser.BlendModes.ADD)
    const art = this.add.image(0, 0, OFFLINE_CORNER_TEXTURE_KEY)
    container.add([warmPool, art])

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: warmPool,
        alpha: { from: 0.025, to: 0.07 },
        duration: 2800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }

    this.add.text(68, 387, 'OFFLINE CORNER', {
      color: '#7b86a6',
      fontFamily: 'sans-serif',
      fontSize: '8px',
      letterSpacing: 2,
    }).setDepth(900)
  }

  private drawRagRack() {
    const container = this.add.container(802, 167).setDepth(167).setAlpha(0.98)
    const dataSignal = this.add.ellipse(5, 0, 132, 52, 0x5cdfff, 0.045)
      .setBlendMode(Phaser.BlendModes.ADD)
    const art = this.add.image(0, 0, RAG_PIPELINE_TEXTURE_KEY)
    const responsePacket = this.add.container(-70, -8).setAlpha(0)
    const packetHead = this.add.rectangle(0, 0, 5, 2, 0x5cdfff, 1)
      .setBlendMode(Phaser.BlendModes.ADD)
    const packetTail = this.add.rectangle(-6, 0, 2, 2, 0x8a63ff, 0.9)
      .setBlendMode(Phaser.BlendModes.ADD)
    responsePacket.add([packetHead, packetTail])
    this.ragResponsePacket = responsePacket
    container.add([dataSignal, art, responsePacket])

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: dataSignal,
        alpha: { from: 0.02, to: 0.075 },
        scaleX: { from: 0.92, to: 1.04 },
        duration: 2100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }

    this.add.text(733, 113, 'RAG PIPELINE / LIVE', {
      color: '#7084ad',
      fontFamily: 'sans-serif',
      fontSize: '8px',
      letterSpacing: 2,
    }).setDepth(900)
  }

  private playRagCoreAcknowledgement() {
    const packet = this.ragResponsePacket
    if (!packet || this.hasAcknowledgedCoreVisit) return
    this.hasAcknowledgedCoreVisit = true

    if (this.reducedMotion) {
      packet.setPosition(58, -8).setAlpha(0.7)
      return
    }

    packet.setPosition(-70, -8).setAlpha(0)
    this.tweens.add({
      targets: packet,
      x: 66,
      alpha: { from: 0, to: 1 },
      duration: 720,
      ease: 'Quad.Out',
      onComplete: () => {
        this.tweens.add({
          targets: packet,
          alpha: 0,
          duration: 240,
          ease: 'Quad.Out',
        })
      },
    })
  }

  private createStation(layout: StationLayout): InteractiveStation {
    const { id, x, y, width, height, interactionPadding } = layout
    const container = this.drawStation(layout)
    const collision = getStationCollisionRect(layout)
    const obstacle = this.createStaticBlock(
      collision.x,
      collision.y,
      collision.width,
      collision.height,
    )
    this.physics.add.collider(this.player, obstacle)

    const focusFrame = this.add.rectangle(x, y, width + 10, height + 10)
      .setStrokeStyle(2, layout.color, 0.2)
      .setDepth(1000)

    const label = this.add.text(
      x,
      y + height / 2 + (layout.labelGap ?? 12),
      stationById[id].title.toUpperCase(),
      {
        color: Phaser.Display.Color.IntegerToColor(layout.color).rgba,
        fontFamily: 'sans-serif',
        fontSize: '9px',
        fontStyle: 'bold',
        letterSpacing: 1.5,
      },
    ).setOrigin(0.5, 0).setAlpha(0.55).setDepth(1001)

    const visitedMark = this.add.text(x + width / 2 - 2, y - height / 2 - 3, '◆', {
      color: '#8a63ff',
      fontFamily: 'sans-serif',
      fontSize: '11px',
    }).setOrigin(1, 0).setAlpha(0).setDepth(1001)

    const zoneWidth = width + interactionPadding
    const zoneHeight = height + interactionPadding
    const zone = this.add.zone(x, y, zoneWidth, zoneHeight)
      .setInteractive({ useHandCursor: true })

    this.interactionDebugRects.push(
      new Phaser.Geom.Rectangle(x - zoneWidth / 2, y - zoneHeight / 2, zoneWidth, zoneHeight),
    )

    zone.on('pointerover', () => {
      this.hoveredStation = id
      this.refreshAllStationStates()
    })
    zone.on('pointerout', () => {
      if (this.hoveredStation === id) this.hoveredStation = null
      this.refreshAllStationStates()
    })
    zone.on('pointerdown', () => labBridge.emit('station:activate', { stationId: id }))

    this.stationVisuals.set(id, { container, focusFrame, label, visitedMark })
    this.refreshStationState(id)

    return { id, zone }
  }

  private drawStation(layout: StationLayout) {
    switch (layout.id) {
      case 'assistant':
        return this.drawAssistant(layout)
      case 'experience':
        return this.drawExperienceArchive(layout)
      case 'systems':
        return this.drawLivingCore(layout)
      case 'projects':
        return this.drawProjectTerminal(layout)
      case 'future':
        return this.drawFutureGate(layout)
    }
  }

  private drawAssistant({ x, y, color }: StationLayout) {
    const container = this.add.container(x, y).setDepth(y).setAlpha(0.96)
    const signal = this.add.ellipse(0, 10, 90, 66, color, 0.07)
      .setBlendMode(Phaser.BlendModes.ADD)
    const art = this.add.image(0, 0, LAB_COMPANION_TEXTURE_KEY)
    container.add([signal, art])

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: signal,
        alpha: { from: 0.035, to: 0.11 },
        duration: 2100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }

    return container
  }

  private drawExperienceArchive({ x, y }: StationLayout) {
    const container = this.add.container(x, y).setDepth(y).setAlpha(0.98)
    const memoryGlow = this.add.ellipse(-42, 5, 92, 78, 0xffc45c, 0.07)
      .setBlendMode(Phaser.BlendModes.ADD)
    const researchGlow = this.add.ellipse(50, 0, 76, 68, 0x5cdfff, 0.05)
      .setBlendMode(Phaser.BlendModes.ADD)
    const art = this.add.image(0, 0, EXPERIENCE_ARCHIVE_TEXTURE_KEY)
      .setOrigin(0.5, EXPERIENCE_ARCHIVE_ORIGIN_Y)
    container.add([memoryGlow, researchGlow, art])

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: [memoryGlow, researchGlow],
        alpha: { from: 0.035, to: 0.095 },
        duration: 2400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }

    return container
  }

  private drawLivingCore({ x, y, color }: StationLayout) {
    const container = this.add.container(x, y).setDepth(y).setAlpha(0.96)
    const aura = this.add.ellipse(0, 4, 152, 118, color, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD)
    const art = this.add.image(0, 0, LIVING_CORE_TEXTURE_KEY)
      .setOrigin(0.5, LIVING_CORE_ORIGIN_Y)
    container.add([aura, art])

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: aura,
        alpha: { from: 0.04, to: 0.14 },
        scale: { from: 0.96, to: 1.04 },
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }

    return container
  }

  private drawProjectTerminal({ x, y, color }: StationLayout) {
    const container = this.add.container(x, y).setDepth(y).setAlpha(0.96)
    const gameSignal = this.add.ellipse(-45, -8, 74, 58, 0xcd55ff, 0.045)
      .setBlendMode(Phaser.BlendModes.ADD)
    const aiSignal = this.add.ellipse(47, -5, 76, 62, 0x5cdfff, 0.04)
      .setBlendMode(Phaser.BlendModes.ADD)
    const status = this.add.rectangle(73, 27, 14, 5, color, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD)
    const art = this.add.image(0, 0, SELECTED_WORK_TEXTURE_KEY)
    container.add([gameSignal, aiSignal, status, art])

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: [gameSignal, aiSignal, status],
        alpha: { from: 0.025, to: 0.085 },
        duration: 2300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }

    return container
  }

  private drawFutureGate({ x, y, color }: StationLayout) {
    const container = this.add.container(x, y).setDepth(y).setAlpha(0.96)
    const calibration = this.add.ellipse(0, 2, 92, 74, color, 0.055)
      .setBlendMode(Phaser.BlendModes.ADD)
    const art = this.add.image(0, 0, FUTURE_GATE_TEXTURE_KEY)
    container.add([calibration, art])

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: calibration,
        alpha: { from: 0.025, to: 0.09 },
        duration: 1700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }

    return container
  }

  private refreshAllStationStates() {
    this.stationVisuals.forEach((_, id) => this.refreshStationState(id))
  }

  private refreshStationState(id: StationId) {
    const visual = this.stationVisuals.get(id)
    if (!visual) return

    const active = this.activeStation === id
    const focused = active || this.nearbyStation === id || this.hoveredStation === id
    const visited = this.visitedStations.has(id)
    const duration = this.reducedMotion ? 0 : 180

    this.tweens.killTweensOf([
      visual.container,
      visual.focusFrame,
      visual.label,
      visual.visitedMark,
    ])

    if (duration === 0) {
      visual.container.setAlpha(focused ? 1 : visited ? 0.94 : 0.86)
      visual.container.setScale(active ? 1.035 : focused ? 1.02 : 1)
      visual.focusFrame.setAlpha(focused ? 1 : visited ? 0.48 : 0.2)
      visual.label.setAlpha(focused ? 1 : visited ? 0.78 : 0.5)
      visual.visitedMark.setAlpha(visited ? 1 : 0)
      return
    }

    this.tweens.add({
      targets: visual.container,
      alpha: focused ? 1 : visited ? 0.94 : 0.86,
      scale: active ? 1.035 : focused ? 1.02 : 1,
      duration,
      ease: 'Quad.Out',
    })
    this.tweens.add({
      targets: visual.focusFrame,
      alpha: focused ? 1 : visited ? 0.48 : 0.2,
      duration,
      ease: 'Quad.Out',
    })
    this.tweens.add({
      targets: visual.label,
      alpha: focused ? 1 : visited ? 0.78 : 0.5,
      duration,
      ease: 'Quad.Out',
    })
    this.tweens.add({
      targets: visual.visitedMark,
      alpha: visited ? 1 : 0,
      duration,
      ease: 'Quad.Out',
    })
  }

  private createStaticBlock(x: number, y: number, width: number, height: number) {
    this.collisionDebugRects.push(
      new Phaser.Geom.Rectangle(x - width / 2, y - height / 2, width, height),
    )

    return this.physics.add.staticImage(x, y, 'pixel')
      .setDisplaySize(width, height)
      .setAlpha(0)
      .refreshBody()
  }

  private createDebugOverlay() {
    this.debugKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F2)
    this.debugGraphics = this.add.graphics().setDepth(2000).setVisible(false)
    this.debugLabel = this.add.text(LAB_WIDTH - 68, LAB_HEIGHT - 31, 'F2 / DEBUG', {
      color: '#586687',
      fontFamily: 'sans-serif',
      fontSize: '9px',
      letterSpacing: 1,
    }).setOrigin(1, 0).setDepth(2001)
  }

  private renderDebugOverlay() {
    this.debugGraphics.clear().setVisible(this.debugVisible)
    this.debugLabel.setColor(this.debugVisible ? '#ffc45c' : '#586687')

    if (!this.debugVisible) return
    const { worldBounds, playerSpawn } = this.layout

    this.debugGraphics.fillStyle(0xff4d72, 0.1)
    this.debugGraphics.lineStyle(2, 0xff4d72, 0.85)
    this.collisionDebugRects.forEach((rect) => {
      this.debugGraphics.fillRectShape(rect)
      this.debugGraphics.strokeRectShape(rect)
    })

    this.debugGraphics.fillStyle(0x5cdfff, 0.06)
    this.debugGraphics.lineStyle(1, 0x5cdfff, 0.75)
    this.interactionDebugRects.forEach((rect) => {
      this.debugGraphics.fillRectShape(rect)
      this.debugGraphics.strokeRectShape(rect)
    })

    this.debugGraphics.lineStyle(2, 0xffc45c, 0.9)
    this.debugGraphics.strokeRectShape(
      new Phaser.Geom.Rectangle(
        worldBounds.x,
        worldBounds.y,
        worldBounds.width,
        worldBounds.height,
      ),
    )
    this.debugGraphics.fillStyle(0x8a63ff, 1)
    this.debugGraphics.fillCircle(playerSpawn.x, playerSpawn.y, 5)
  }
}
