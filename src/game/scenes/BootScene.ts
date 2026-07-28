import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot')
  }

  create() {
    const player = this.add.graphics()
    player.fillStyle(0x61ddff)
    player.fillRoundedRect(3, 2, 18, 22, 4)
    player.fillStyle(0xd7e8ff)
    player.fillRect(7, 6, 3, 3)
    player.fillRect(14, 6, 3, 3)
    player.generateTexture('player', 24, 28)
    player.destroy()

    const pixel = this.add.graphics()
    pixel.fillStyle(0xffffff)
    pixel.fillRect(0, 0, 2, 2)
    pixel.generateTexture('pixel', 2, 2)
    pixel.destroy()

    this.scene.start('lab')
  }
}
