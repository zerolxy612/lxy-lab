import Phaser from 'phaser'
import type { RoomRouteLayout } from '../layout/labLayout'
import type { InteractiveRoomRoute } from '../systems/InteractionSystem'

export class ArchiveFloorExit implements InteractiveRoomRoute {
  readonly id: RoomRouteLayout['id']
  readonly label: string
  readonly zone: Phaser.GameObjects.Zone

  private readonly scene: Phaser.Scene
  private readonly reducedMotion: boolean
  private readonly leftPanel: Phaser.GameObjects.Container
  private readonly rightPanel: Phaser.GameObjects.Container
  private readonly focusFrame: Phaser.GameObjects.Rectangle
  private readonly signal: Phaser.GameObjects.Rectangle
  private opening = false

  constructor(scene: Phaser.Scene, layout: RoomRouteLayout, reducedMotion: boolean) {
    this.scene = scene
    this.reducedMotion = reducedMotion
    this.id = layout.id
    this.label = layout.label

    const x = layout.x + layout.visualOffsetX
    const y = layout.y + layout.visualOffsetY
    const root = scene.add.container(x, y).setDepth(474)
    const shaftGlow = scene.add.ellipse(0, 4, 154, 48, 0x5cdfff, 0.035)
      .setBlendMode(Phaser.BlendModes.ADD)
    const recess = scene.add.rectangle(0, 0, 132, 24, 0x02040a, 0.98)
      .setStrokeStyle(1, 0x263854, 0.9)
    const lowerRail = scene.add.rectangle(0, 15, 142, 5, 0x101827, 1)
      .setStrokeStyle(1, 0x35445f, 0.8)
    this.leftPanel = this.createPanel(-33)
    this.rightPanel = this.createPanel(33)
    this.signal = scene.add.rectangle(0, -12, 42, 2, 0x5cdfff, 0.55)
      .setBlendMode(Phaser.BlendModes.ADD)
    const leftNode = this.createAccessNode(-75)
    const rightNode = this.createAccessNode(75)
    root.add([
      shaftGlow,
      recess,
      lowerRail,
      this.leftPanel,
      this.rightPanel,
      this.signal,
      leftNode,
      rightNode,
    ])

    scene.add.text(x, y - 27, 'A–02  ARCHIVE TRANSFER', {
      color: '#7286a8',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      letterSpacing: 1.4,
    }).setOrigin(0.5).setDepth(475)

    this.focusFrame = scene.add.rectangle(x, y, 164, 58)
      .setStrokeStyle(1, 0xffc45c, 0.72)
      .setAlpha(0)
      .setDepth(476)

    const zoneWidth = layout.width + layout.interactionPadding
    const zoneHeight = layout.height + layout.interactionPadding
    this.zone = scene.add.zone(layout.x, layout.y, zoneWidth, zoneHeight)
      .setInteractive({ useHandCursor: true })
    this.zone.on('pointerover', () => this.setFocused(true))
    this.zone.on('pointerout', () => this.setFocused(false))
  }

  open(reducedMotion: boolean, onComplete: () => void) {
    if (this.opening) return false
    this.opening = true
    this.setFocused(false)

    if (reducedMotion) {
      onComplete()
      return true
    }

    this.scene.tweens.add({
      targets: this.signal,
      alpha: 1,
      scaleX: 1.7,
      duration: 100,
      ease: 'Quad.Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.leftPanel,
          x: -64,
          alpha: 0.72,
          duration: 260,
          ease: 'Cubic.InOut',
        })
        this.scene.tweens.add({
          targets: this.rightPanel,
          x: 64,
          alpha: 0.72,
          duration: 260,
          ease: 'Cubic.InOut',
          onComplete: () => this.scene.time.delayedCall(90, onComplete),
        })
      },
    })
    return true
  }

  private createPanel(x: number) {
    const panel = this.scene.add.container(x, 0)
    panel.add(this.scene.add.rectangle(0, 0, 64, 20, 0x111a2b, 1)
      .setStrokeStyle(1, 0x35445f, 0.92))
    panel.add(this.scene.add.rectangle(0, -5, 50, 2, 0x263955, 0.92))
    panel.add(this.scene.add.rectangle(x < 0 ? 22 : -22, 5, 8, 2, 0xffc45c, 0.48))
    return panel
  }

  private createAccessNode(x: number) {
    const node = this.scene.add.container(x, 1)
    node.add(this.scene.add.rectangle(0, 0, 12, 30, 0x101827, 1)
      .setStrokeStyle(1, 0x35445f, 0.9))
    node.add(this.scene.add.rectangle(0, -7, 4, 4, 0x8a63ff, 0.78)
      .setBlendMode(Phaser.BlendModes.ADD))
    return node
  }

  private setFocused(focused: boolean) {
    if (this.opening) return
    this.scene.tweens.killTweensOf([this.focusFrame, this.signal])
    const duration = this.reducedMotion ? 0 : 140
    this.scene.tweens.add({
      targets: this.focusFrame,
      alpha: focused ? 0.75 : 0,
      duration,
      ease: 'Quad.Out',
    })
    this.scene.tweens.add({
      targets: this.signal,
      alpha: focused ? 1 : 0.55,
      duration,
      ease: 'Quad.Out',
    })
  }
}
