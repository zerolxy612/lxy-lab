import Phaser from 'phaser'
import type { StationId } from '../../content/stations'
import { stationById } from '../../content/stations'
import { labBridge } from '../bridge'
import { LAB_HEIGHT, LAB_WIDTH } from '../config'
import { Player } from '../entities/Player'
import {
  labWorldBounds,
  playerSpawn,
  staticObstacles,
  stationLayouts,
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
  private readonly collisionDebugRects: Phaser.Geom.Rectangle[] = []
  private readonly interactionDebugRects: Phaser.Geom.Rectangle[] = []

  constructor() {
    super('lab')
  }

  create() {
    this.physics.world.setBounds(
      labWorldBounds.x,
      labWorldBounds.y,
      labWorldBounds.width,
      labWorldBounds.height,
    )
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    this.drawArchitecture()
    this.drawHongKongWindow()
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
      this.refreshAllStationStates()
    })
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

  private drawArchitecture() {
    this.cameras.main.setBackgroundColor('#050612')

    const room = this.add.graphics().setDepth(0)
    room.fillStyle(0x090c1d)
    room.fillRect(42, 54, LAB_WIDTH - 84, LAB_HEIGHT - 70)

    room.fillStyle(0x13182f)
    room.fillRect(58, 72, LAB_WIDTH - 116, 104)
    room.fillStyle(0x0d1125)
    room.fillTriangle(58, 72, 58, LAB_HEIGHT - 40, 100, 176)
    room.fillTriangle(LAB_WIDTH - 58, 72, LAB_WIDTH - 58, LAB_HEIGHT - 40, LAB_WIDTH - 100, 176)

    room.fillStyle(0x10152a)
    room.fillRect(58, 176, LAB_WIDTH - 116, LAB_HEIGHT - 216)

    room.lineStyle(1, 0x253154, 0.48)
    for (let x = 76; x < LAB_WIDTH - 58; x += 32) {
      room.lineBetween(x, 176, x, LAB_HEIGHT - 40)
    }
    for (let y = 192; y < LAB_HEIGHT - 40; y += 32) {
      room.lineBetween(58, y, LAB_WIDTH - 58, y)
    }

    room.lineStyle(3, 0x2c3961, 0.95)
    room.strokeRect(42, 54, LAB_WIDTH - 84, LAB_HEIGHT - 70)
    room.lineStyle(2, 0x111733, 1)
    room.strokeRect(58, 72, LAB_WIDTH - 116, LAB_HEIGHT - 112)

    room.fillStyle(0x080b18)
    room.fillRect(430, LAB_HEIGHT - 46, 100, 14)
    room.lineStyle(2, 0x8a63ff, 0.7)
    room.lineBetween(440, LAB_HEIGHT - 47, 520, LAB_HEIGHT - 47)

    this.add.text(68, LAB_HEIGHT - 31, 'LAB-01 / MOVEMENT BUILD', {
      color: '#586687',
      fontFamily: 'sans-serif',
      fontSize: '9px',
      letterSpacing: 2,
    }).setDepth(3)
  }

  private drawHongKongWindow() {
    const window = this.add.graphics().setDepth(1)
    window.fillStyle(0x04091d)
    window.fillRect(270, 70, 420, 94)
    window.lineStyle(3, 0x263456, 1)
    window.strokeRect(266, 66, 428, 102)

    const buildings = [
      [278, 123, 30, 41], [312, 105, 22, 59], [338, 118, 35, 46],
      [378, 91, 28, 73], [411, 113, 22, 51], [439, 100, 36, 64],
      [480, 85, 26, 79], [511, 111, 38, 53], [554, 96, 24, 68],
      [583, 116, 30, 48], [618, 101, 28, 63], [651, 124, 31, 40],
    ] as const

    buildings.forEach(([x, y, width, height], index) => {
      window.fillStyle(index % 3 === 0 ? 0x19134a : 0x0b2447)
      window.fillRect(x, y, width, height)
      const light = index % 2 === 0 ? 0xcd55ff : 0x5cdfff
      window.fillStyle(light, 0.65)
      for (let row = y + 7; row < y + height - 4; row += 10) {
        for (let column = x + 6; column < x + width - 3; column += 9) {
          if ((row + column + index) % 3 !== 0) window.fillRect(column, row, 2, 3)
        }
      }
    })

    window.fillStyle(0x6f47d8, 0.34)
    window.fillRect(270, 150, 420, 14)
    window.lineStyle(1, 0x5cdfff, 0.28)
    for (let x = 286; x < 684; x += 24) {
      window.lineBetween(x, 78, x - 8, 111)
    }

    this.add.text(630, 79, '香港 / HK', {
      color: '#ff55c7',
      fontFamily: 'sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setDepth(2)
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
    const corner = this.add.graphics().setDepth(4)
    corner.fillStyle(0x171a31)
    corner.fillRoundedRect(64, 405, 164, 66, 6)
    corner.fillStyle(0x222945)
    corner.fillRoundedRect(72, 412, 68, 43, 4)
    corner.fillRoundedRect(146, 412, 72, 43, 4)
    corner.fillStyle(0x8a63ff, 0.28)
    corner.fillRect(72, 453, 146, 5)

    corner.fillStyle(0x171d37)
    corner.fillRoundedRect(246, 407, 82, 49, 10)
    corner.lineStyle(2, 0x5b668a, 0.55)
    corner.strokeRoundedRect(246, 407, 82, 49, 10)
    corner.fillStyle(0xffc45c, 0.85)
    corner.fillCircle(272, 427, 6)
    corner.fillStyle(0xcd55ff, 0.8)
    corner.fillRect(292, 420, 20, 13)

    this.add.text(68, 387, 'OFFLINE CORNER', {
      color: '#7b86a6',
      fontFamily: 'sans-serif',
      fontSize: '8px',
      letterSpacing: 2,
    }).setDepth(5)
  }

  private drawRagRack() {
    const rack = this.add.graphics().setDepth(4)
    rack.fillStyle(0x10162d)
    rack.fillRoundedRect(720, 125, 164, 84, 4)
    rack.lineStyle(2, 0x334066, 0.9)
    rack.strokeRoundedRect(720, 125, 164, 84, 4)

    for (let x = 734; x < 868; x += 44) {
      rack.fillStyle(0x080c1c)
      rack.fillRect(x, 139, 32, 54)
      rack.lineStyle(1, 0x5cdfff, 0.45)
      rack.strokeRect(x, 139, 32, 54)
      for (let y = 146; y < 189; y += 10) {
        rack.fillStyle((x + y) % 3 === 0 ? 0xcd55ff : 0x5cdfff, 0.85)
        rack.fillRect(x + 7, y, 4, 2)
      }
    }

    this.add.text(733, 113, 'RAG PIPELINE / LIVE', {
      color: '#7084ad',
      fontFamily: 'sans-serif',
      fontSize: '8px',
      letterSpacing: 2,
    }).setDepth(5)
  }

  private createStation(layout: StationLayout): InteractiveStation {
    const { id, x, y, width, height, interactionPadding } = layout
    const container = this.drawStation(layout)
    const obstacle = this.createStaticBlock(x, y, width, height)
    this.physics.add.collider(this.player, obstacle)

    const focusFrame = this.add.rectangle(x, y, width + 10, height + 10)
      .setStrokeStyle(2, layout.color, 0.2)
      .setDepth(14)

    const label = this.add.text(x, y + height / 2 + 12, stationById[id].title.toUpperCase(), {
      color: Phaser.Display.Color.IntegerToColor(layout.color).rgba,
      fontFamily: 'sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      letterSpacing: 1.5,
    }).setOrigin(0.5, 0).setAlpha(0.55).setDepth(15)

    const visitedMark = this.add.text(x + width / 2 - 2, y - height / 2 - 3, '◆', {
      color: '#8a63ff',
      fontFamily: 'sans-serif',
      fontSize: '11px',
    }).setOrigin(1, 0).setAlpha(0).setDepth(15)

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
    const container = this.add.container(x, y).setDepth(8).setAlpha(0.88)
    const art = this.add.graphics()
    art.fillStyle(0x10152a)
    art.fillCircle(0, 18, 42)
    art.lineStyle(3, color, 0.8)
    art.strokeCircle(0, 18, 38)
    art.fillStyle(0xdce7ff)
    art.fillRoundedRect(-20, -18, 40, 38, 9)
    art.fillStyle(0x151b35)
    art.fillRoundedRect(-14, -12, 28, 17, 5)
    art.fillStyle(0x5cdfff)
    art.fillCircle(-7, -4, 2)
    art.fillCircle(7, -4, 2)
    art.fillStyle(0x9caed0)
    art.fillRect(-14, 20, 28, 8)
    container.add(art)
    return container
  }

  private drawExperienceArchive({ x, y, width, height, color }: StationLayout) {
    const container = this.add.container(x, y).setDepth(8).setAlpha(0.88)
    const art = this.add.graphics()
    art.fillStyle(0x171c34)
    art.fillRoundedRect(-width / 2, -height / 2, width, height, 4)
    art.lineStyle(2, color, 0.7)
    art.strokeRoundedRect(-width / 2, -height / 2, width, height, 4)

    for (let row = 0; row < 3; row += 1) {
      art.fillStyle(0x0b1024)
      art.fillRect(-width / 2 + 12, -height / 2 + 13 + row * 29, 74, 21)
      art.fillStyle(row === 1 ? 0xcd55ff : 0x5cdfff, 0.8)
      art.fillRect(-width / 2 + 20, -height / 2 + 21 + row * 29, 30, 3)
    }

    art.fillStyle(0x242946)
    art.fillRect(16, -height / 2 + 15, 60, 48)
    art.fillStyle(0xffc45c, 0.8)
    art.fillRect(25, -height / 2 + 24, 42, 4)
    art.fillStyle(0x0c1020)
    art.fillRect(12, 28, 68, 19)
    container.add(art)
    return container
  }

  private drawLivingCore({ x, y, color }: StationLayout) {
    const container = this.add.container(x, y).setDepth(9)
    const base = this.add.graphics()
    base.fillStyle(0x080d20)
    base.fillEllipse(0, 44, 152, 44)
    base.lineStyle(4, 0x8a63ff, 0.8)
    base.strokeEllipse(0, 44, 138, 34)
    base.lineStyle(2, color, 0.9)
    base.strokeEllipse(0, 38, 112, 26)
    base.fillStyle(0x101a35)
    base.fillRoundedRect(-53, -47, 106, 91, 12)
    base.lineStyle(3, color, 0.9)
    base.strokeRoundedRect(-53, -47, 106, 91, 12)
    container.add(base)

    const graph = this.add.graphics()
    graph.lineStyle(2, 0x5cdfff, 0.78)
    const edges = [
      [0, 28, 0, 5], [0, 5, -23, -10], [0, 5, 25, -12],
      [-23, -10, -35, -31], [-23, -10, -10, -30],
      [25, -12, 12, -34], [25, -12, 39, -29],
    ] as const
    edges.forEach(([x1, y1, x2, y2]) => graph.lineBetween(x1, y1, x2, y2))
    graph.fillStyle(0xcd55ff)
    ;[[0, 28], [0, 5], [-23, -10], [25, -12], [-35, -31], [-10, -30], [12, -34], [39, -29]]
      .forEach(([nodeX, nodeY], index) => graph.fillCircle(nodeX, nodeY, index < 2 ? 4 : 3))
    container.add(graph)

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: graph,
        alpha: { from: 0.48, to: 1 },
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }

    return container
  }

  private drawProjectTerminal({ x, y, width, height, color }: StationLayout) {
    const container = this.add.container(x, y).setDepth(8).setAlpha(0.9)
    const art = this.add.graphics()
    art.fillStyle(0x171a32)
    art.fillRoundedRect(-width / 2, -height / 2, width, height, 5)
    art.lineStyle(2, color, 0.7)
    art.strokeRoundedRect(-width / 2, -height / 2, width, height, 5)
    art.fillStyle(0x080d22)
    art.fillRect(-75, -42, 72, 55)
    art.fillRect(7, -42, 70, 55)
    art.lineStyle(2, 0xcd55ff, 0.8)
    art.strokeRect(-75, -42, 72, 55)
    art.lineStyle(2, 0x5cdfff, 0.8)
    art.strokeRect(7, -42, 70, 55)
    art.fillStyle(0xcd55ff, 0.65)
    art.fillRect(-64, -30, 42, 4)
    art.fillRect(-64, -19, 26, 3)
    art.fillStyle(0x5cdfff, 0.65)
    art.fillRect(18, -30, 46, 4)
    art.fillRect(18, -19, 32, 3)
    art.fillStyle(0x0a0d1c)
    art.fillRect(-50, 27, 100, 23)
    container.add(art)
    return container
  }

  private drawFutureGate({ x, y, width, height, color }: StationLayout) {
    const container = this.add.container(x, y).setDepth(8).setAlpha(0.9)
    const art = this.add.graphics()
    art.fillStyle(0x080b1b)
    art.fillRoundedRect(-width / 2, -height / 2, width, height, 4)
    art.lineStyle(4, 0x8a63ff, 0.8)
    art.strokeRoundedRect(-width / 2, -height / 2, width, height, 4)
    art.lineStyle(2, color, 0.8)
    art.strokeRoundedRect(-width / 2 + 10, -height / 2 + 10, width - 20, height - 10, 2)
    art.lineBetween(0, -height / 2 + 11, 0, height / 2)
    art.fillStyle(color, 0.9)
    art.fillCircle(-8, 8, 2)
    art.fillCircle(8, 8, 2)
    container.add(art)
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
    this.debugGraphics = this.add.graphics().setDepth(90).setVisible(false)
    this.debugLabel = this.add.text(LAB_WIDTH - 68, LAB_HEIGHT - 31, 'F2 / DEBUG', {
      color: '#586687',
      fontFamily: 'sans-serif',
      fontSize: '9px',
      letterSpacing: 1,
    }).setOrigin(1, 0).setDepth(91)
  }

  private renderDebugOverlay() {
    this.debugGraphics.clear().setVisible(this.debugVisible)
    this.debugLabel.setColor(this.debugVisible ? '#ffc45c' : '#586687')

    if (!this.debugVisible) return

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
        labWorldBounds.x,
        labWorldBounds.y,
        labWorldBounds.width,
        labWorldBounds.height,
      ),
    )
    this.debugGraphics.fillStyle(0x8a63ff, 1)
    this.debugGraphics.fillCircle(playerSpawn.x, playerSpawn.y, 5)
  }
}
