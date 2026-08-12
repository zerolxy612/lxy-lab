import Phaser from 'phaser'
import { ARCHIVE_DOOR_TEXTURE_KEY } from '../art/archiveDoorArt'
import type { RoomRouteLayout } from '../layout/labLayout'
import type { InteractiveRoomRoute } from '../systems/InteractionSystem'

interface DoorPanel {
  root: Phaser.GameObjects.Container
  openX: number
  openY: number
}

export class RoomDoor implements InteractiveRoomRoute {
  readonly id: RoomRouteLayout['id']
  readonly label: string
  readonly zone: Phaser.GameObjects.Zone

  private readonly scene: Phaser.Scene
  private readonly panels: readonly DoorPanel[]
  private readonly focusFrame: Phaser.GameObjects.Rectangle
  private readonly statusLight: Phaser.GameObjects.Rectangle
  private readonly reducedMotion: boolean
  private opening = false

  constructor(scene: Phaser.Scene, layout: RoomRouteLayout, reducedMotion: boolean) {
    this.scene = scene
    this.reducedMotion = reducedMotion
    this.id = layout.id
    this.label = layout.label

    const visualX = layout.x + layout.visualOffsetX
    const visualY = layout.y + layout.visualOffsetY
    const container = scene.add.container(visualX, visualY).setDepth(335)
    const accessGlow = scene.add.ellipse(38, 34, 154, 66, 0xffc45c, 0.035)
      .setBlendMode(Phaser.BlendModes.ADD)
    const architecture = scene.add.image(0, 0, ARCHIVE_DOOR_TEXTURE_KEY)
    const recess = scene.add.rectangle(-26, 0, 52, 70, 0x02040b, 0.96)
    const opensVertically = layout.orientation === 'left'
    const firstPanel = this.createShutterPanel(
      opensVertically ? -26 : -18,
      opensVertically ? -18 : 0,
      opensVertically ? 52 : 34,
      opensVertically ? 34 : 70,
    )
    const secondPanel = this.createShutterPanel(
      opensVertically ? -26 : 18,
      opensVertically ? 18 : 0,
      opensVertically ? 52 : 34,
      opensVertically ? 34 : 70,
    )
    this.panels = opensVertically
      ? [
          { root: firstPanel, openX: -26, openY: -54 },
          { root: secondPanel, openX: -26, openY: 54 },
        ]
      : [
          { root: firstPanel, openX: -54, openY: 0 },
          { root: secondPanel, openX: 54, openY: 0 },
        ]

    const panelMaskShape = scene.make.graphics({ x: 0, y: 0 }, false)
    panelMaskShape.fillStyle(0xffffff)
    panelMaskShape.fillRect(visualX - 52, visualY - 36, 52, 72)
    const panelMask = panelMaskShape.createGeometryMask()
    firstPanel.setMask(panelMask)
    secondPanel.setMask(panelMask)

    this.statusLight = scene.add.rectangle(50, -57, 5, 18, 0xffc45c, 0.48)
      .setBlendMode(Phaser.BlendModes.ADD)
    container.add([accessGlow, architecture, recess, firstPanel, secondPanel, this.statusLight])

    scene.add.text(visualX + 35, visualY + 47, 'ARCHIVE WING', {
      color: '#ffc45c',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      letterSpacing: 1.2,
    }).setOrigin(0.5).setDepth(338)

    this.focusFrame = scene.add.rectangle(visualX + 18, visualY, 166, 150)
      .setStrokeStyle(1, 0xffc45c, 0.7)
      .setAlpha(0)
      .setDepth(339)

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
      targets: this.statusLight,
      alpha: 1,
      scaleY: 1.35,
      duration: 90,
      ease: 'Quad.Out',
      onComplete: () => {
        this.panels.forEach(({ root, openX, openY }, index) => {
          this.scene.tweens.add({
            targets: root,
            x: openX,
            y: openY,
            duration: 240,
            ease: 'Cubic.InOut',
            onComplete: index === this.panels.length - 1
              ? () => this.scene.time.delayedCall(80, onComplete)
              : undefined,
          })
        })
      },
    })
    return true
  }

  private createShutterPanel(x: number, y: number, width: number, height: number) {
    const panel = this.scene.add.container(x, y)
    const plate = this.scene.add.rectangle(0, 0, width, height, 0x101827, 1)
      .setStrokeStyle(1, 0x31415b, 0.9)
    const seam = this.scene.add.rectangle(0, 0, width - 8, 2, 0x273a51, 0.9)
    const signal = this.scene.add.rectangle(width / 2 - 7, 0, 3, 8, 0x5cdfff, 0.55)
    panel.add([plate, seam, signal])
    return panel
  }

  private setFocused(focused: boolean) {
    if (this.opening) return
    this.scene.tweens.killTweensOf([this.focusFrame, this.statusLight])
    const duration = this.reducedMotion ? 0 : 140
    this.scene.tweens.add({
      targets: this.focusFrame,
      alpha: focused ? 0.72 : 0,
      duration,
      ease: 'Quad.Out',
    })
    this.scene.tweens.add({
      targets: this.statusLight,
      alpha: focused ? 0.95 : 0.48,
      duration,
      ease: 'Quad.Out',
    })
  }
}
