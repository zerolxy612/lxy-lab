import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot')
  }

  create() {
    const player = this.add.graphics()
    player.fillStyle(0x070a14)
    player.fillRect(5, 1, 14, 5)
    player.fillRect(3, 5, 18, 5)
    player.fillStyle(0xc58f73)
    player.fillRect(5, 8, 14, 8)
    player.fillStyle(0x12182e)
    player.fillRect(4, 16, 16, 9)
    player.fillStyle(0x5cdfff)
    player.fillRect(5, 17, 2, 7)
    player.fillStyle(0x8a63ff)
    player.fillRect(17, 17, 2, 7)
    player.fillStyle(0x0a0d19)
    player.fillRect(5, 25, 5, 4)
    player.fillRect(14, 25, 5, 4)
    player.fillStyle(0xe5efff)
    player.fillRect(8, 11, 2, 2)
    player.fillRect(15, 11, 2, 2)
    player.generateTexture('player', 24, 30)
    player.destroy()

    const pixel = this.add.graphics()
    pixel.fillStyle(0xffffff)
    pixel.fillRect(0, 0, 2, 2)
    pixel.generateTexture('pixel', 2, 2)
    pixel.destroy()

    this.scene.start('lab')
  }
}
