import Phaser from 'phaser'

const SPEED = 170

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private readonly movementKeys: Record<'up' | 'left' | 'down' | 'right', Phaser.Input.Keyboard.Key>

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player')

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.cursors = scene.input.keyboard!.createCursorKeys()
    this.movementKeys = scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<'up' | 'left' | 'down' | 'right', Phaser.Input.Keyboard.Key>

    this.setCollideWorldBounds(true)
    this.setDepth(20)
  }

  move(enabled: boolean) {
    if (!enabled) {
      this.setVelocity(0)
      return
    }

    const horizontal = Number(this.cursors.right.isDown || this.movementKeys.right.isDown)
      - Number(this.cursors.left.isDown || this.movementKeys.left.isDown)
    const vertical = Number(this.cursors.down.isDown || this.movementKeys.down.isDown)
      - Number(this.cursors.up.isDown || this.movementKeys.up.isDown)
    const direction = new Phaser.Math.Vector2(horizontal, vertical).normalize()

    this.setVelocity(direction.x * SPEED, direction.y * SPEED)
  }
}
