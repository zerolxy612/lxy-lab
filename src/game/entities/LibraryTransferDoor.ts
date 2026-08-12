import Phaser from 'phaser'
import type { LibraryInteraction } from '../layout/libraryLayout'

export class LibraryTransferDoor {
  private readonly scene: Phaser.Scene
  private readonly reducedMotion: boolean
  private readonly leftPanel: Phaser.GameObjects.Container
  private readonly rightPanel: Phaser.GameObjects.Container
  private readonly thresholdGlow: Phaser.GameObjects.Ellipse
  private readonly statusLight: Phaser.GameObjects.Rectangle
  private opening = false

  constructor(scene: Phaser.Scene, layout: LibraryInteraction, reducedMotion: boolean) {
    this.scene = scene
    this.reducedMotion = reducedMotion

    const x = layout.x
    const y = layout.y + 14
    const root = scene.add.container(x, y).setDepth(390)

    this.thresholdGlow = scene.add.ellipse(0, 18, 142, 38, 0x5cdfff, 0.08)
      .setBlendMode(Phaser.BlendModes.ADD)
    const recess = scene.add.rectangle(0, 0, 110, 42, 0x03070d, 0.62)
      .setStrokeStyle(1, 0x28647b, 0.58)
    this.leftPanel = this.createPanel(-27)
    this.rightPanel = this.createPanel(27)
    this.statusLight = scene.add.rectangle(0, -27, 44, 2, 0x5cdfff, 0.72)
      .setBlendMode(Phaser.BlendModes.ADD)

    root.add([
      this.thresholdGlow,
      recess,
      this.leftPanel,
      this.rightPanel,
      this.statusLight,
    ])

    scene.add.text(x, y - 39, 'A–02  MAIN LAB TRANSFER', {
      color: '#75a5b8',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      letterSpacing: 1.15,
    }).setOrigin(0.5).setDepth(391)

    if (!reducedMotion) {
      scene.tweens.add({
        targets: [this.thresholdGlow, this.statusLight],
        alpha: { from: 0.48, to: 1 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }
  }

  playArrival() {
    if (this.reducedMotion) return

    this.leftPanel.setX(-52).setAlpha(0.72)
    this.rightPanel.setX(52).setAlpha(0.72)
    this.statusLight.setAlpha(1).setScale(1.35, 1)
    this.scene.time.delayedCall(180, () => {
      this.scene.tweens.add({
        targets: this.leftPanel,
        x: -27,
        alpha: 1,
        duration: 320,
        ease: 'Cubic.InOut',
      })
      this.scene.tweens.add({
        targets: this.rightPanel,
        x: 27,
        alpha: 1,
        duration: 320,
        ease: 'Cubic.InOut',
      })
      this.scene.tweens.add({
        targets: this.statusLight,
        scaleX: 1,
        duration: 320,
        ease: 'Quad.Out',
      })
    })
  }

  open(onComplete: () => void) {
    if (this.opening) return false
    this.opening = true

    if (this.reducedMotion) {
      onComplete()
      return true
    }

    this.scene.tweens.killTweensOf([
      this.leftPanel,
      this.rightPanel,
      this.thresholdGlow,
      this.statusLight,
    ])
    this.scene.tweens.add({
      targets: this.statusLight,
      alpha: 1,
      scaleX: 1.45,
      duration: 100,
      ease: 'Quad.Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.leftPanel,
          x: -52,
          alpha: 0.72,
          duration: 280,
          ease: 'Cubic.InOut',
        })
        this.scene.tweens.add({
          targets: this.rightPanel,
          x: 52,
          alpha: 0.72,
          duration: 280,
          ease: 'Cubic.InOut',
          onComplete: () => this.scene.time.delayedCall(80, onComplete),
        })
      },
    })
    return true
  }

  setFocused(focused: boolean) {
    if (this.opening) return
    this.scene.tweens.killTweensOf([this.thresholdGlow, this.statusLight])
    const duration = this.reducedMotion ? 0 : 140
    this.scene.tweens.add({
      targets: this.thresholdGlow,
      alpha: focused ? 0.72 : 0.48,
      scaleX: focused ? 1.12 : 1,
      duration,
      ease: 'Quad.Out',
    })
    this.scene.tweens.add({
      targets: this.statusLight,
      alpha: focused ? 1 : 0.72,
      scaleX: focused ? 1.25 : 1,
      duration,
      ease: 'Quad.Out',
    })
  }

  private createPanel(x: number) {
    const panel = this.scene.add.container(x, 0)
    panel.add(this.scene.add.rectangle(0, 0, 50, 36, 0x0b1a25, 0.88)
      .setStrokeStyle(1, 0x28758b, 0.7))
    panel.add(this.scene.add.rectangle(x < 0 ? 17 : -17, 0, 2, 25, 0x5cdfff, 0.48)
      .setBlendMode(Phaser.BlendModes.ADD))
    panel.add(this.scene.add.rectangle(0, 11, 34, 2, 0x173d4d, 0.8))
    return panel
  }
}
