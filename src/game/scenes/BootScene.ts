import Phaser from 'phaser'

type PlayerDirection = 'down' | 'up' | 'side'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot')
  }

  create() {
    const directions: readonly PlayerDirection[] = ['down', 'up', 'side']

    directions.forEach((direction) => {
      this.createPlayerFrame(direction, 0)
      this.createPlayerFrame(direction, 1)
    })

    const pixel = this.add.graphics()
    pixel.fillStyle(0xffffff)
    pixel.fillRect(0, 0, 2, 2)
    pixel.generateTexture('pixel', 2, 2)
    pixel.destroy()

    this.scene.start('lab')
  }

  private createPlayerFrame(direction: PlayerDirection, step: 0 | 1) {
    const frame = this.add.graphics()
    const leftFootOffset = step === 0 ? 0 : 2
    const rightFootOffset = step === 0 ? 2 : 0

    frame.fillStyle(0x070a14)
    frame.fillRect(5, 1, 14, 5)
    frame.fillRect(direction === 'side' ? 6 : 3, 5, direction === 'side' ? 14 : 18, 5)

    if (direction === 'up') {
      frame.fillStyle(0x21172c)
      frame.fillRect(5, 8, 14, 8)
    } else {
      frame.fillStyle(0xc58f73)
      frame.fillRect(5, 8, direction === 'side' ? 12 : 14, 8)
      frame.fillStyle(0xe5efff)
      if (direction === 'side') {
        frame.fillRect(14, 11, 2, 2)
      } else {
        frame.fillRect(8, 11, 2, 2)
        frame.fillRect(15, 11, 2, 2)
      }
    }

    frame.fillStyle(0x12182e)
    frame.fillRect(4, 16, 16, 9)
    frame.fillStyle(0x5cdfff)
    frame.fillRect(5, 17, 2, 7)
    frame.fillStyle(0x8a63ff)
    frame.fillRect(17, 17, 2, 7)
    frame.fillStyle(0x0a0d19)
    frame.fillRect(5, 25 + leftFootOffset, 5, 3)
    frame.fillRect(14, 25 + rightFootOffset, 5, 3)

    frame.generateTexture(`player-${direction}-${step}`, 24, 30)
    frame.destroy()
  }
}
