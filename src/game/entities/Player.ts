import Phaser from 'phaser'
import {
  PLAYER_DIRECTIONS,
  PLAYER_FRAMES,
  PLAYER_SHEET_KEY,
  type PlayerFacing,
} from '../art/playerArt'

const SPEED = 170

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private readonly movementKeys: Record<'up' | 'left' | 'down' | 'right', Phaser.Input.Keyboard.Key>
  private readonly shadow: Phaser.GameObjects.Ellipse
  private facing: PlayerFacing = 'down'

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, PLAYER_SHEET_KEY, PLAYER_FRAMES.down.idle)

    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.shadow = scene.add.ellipse(x, y + 20, 22, 8, 0x02030a, 0.55)
      .setDepth(y - 1)

    this.cursors = scene.input.keyboard!.createCursorKeys()
    this.movementKeys = scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<'up' | 'left' | 'down' | 'right', Phaser.Input.Keyboard.Key>

    this.createAnimations()
    this.setSize(16, 14)
    this.setOffset(12, 32)
    this.setCollideWorldBounds(true)
    this.setDepth(y)
  }

  move(enabled: boolean) {
    if (!enabled) {
      this.stopMovement()
      return false
    }

    const horizontal = Number(this.cursors.right.isDown || this.movementKeys.right.isDown)
      - Number(this.cursors.left.isDown || this.movementKeys.left.isDown)
    const vertical = Number(this.cursors.down.isDown || this.movementKeys.down.isDown)
      - Number(this.cursors.up.isDown || this.movementKeys.up.isDown)
    const direction = new Phaser.Math.Vector2(horizontal, vertical)

    if (direction.lengthSq() === 0) {
      this.stopMovement()
      return false
    }

    direction.normalize()
    this.setVelocity(direction.x * SPEED, direction.y * SPEED)
    this.updateFacing(horizontal, vertical)
    this.play(`player-walk-${this.facing}`, true)
    this.shadow.setPosition(this.x, this.y + 20)

    return true
  }

  override preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta)
    this.shadow.setPosition(this.x, this.y + 20)
    this.shadow.setDepth(this.y - 1)
    this.setDepth(this.y)
  }

  private createAnimations() {
    PLAYER_DIRECTIONS.forEach((direction) => {
      const key = `player-walk-${direction}`
      if (this.scene.anims.exists(key)) return

      this.scene.anims.create({
        key,
        frames: [
          { key: PLAYER_SHEET_KEY, frame: PLAYER_FRAMES[direction].idle },
          { key: PLAYER_SHEET_KEY, frame: PLAYER_FRAMES[direction].walk },
        ],
        frameRate: 7,
        repeat: -1,
      })
    })
  }

  private updateFacing(horizontal: number, vertical: number) {
    if (Math.abs(horizontal) > Math.abs(vertical)) {
      this.facing = horizontal < 0 ? 'left' : 'right'
      return
    }

    this.facing = vertical < 0 ? 'up' : 'down'
  }

  private stopMovement() {
    this.setVelocity(0)
    this.stop()
    this.setTexture(PLAYER_SHEET_KEY, PLAYER_FRAMES[this.facing].idle)
  }
}
