import Phaser from 'phaser'
import {
  EXPERIENCE_ARCHIVE_TEXTURE_KEY,
  EXPERIENCE_ARCHIVE_TEXTURE_URL,
} from '../art/experienceArchiveArt'
import {
  PLAYER_FRAME_HEIGHT,
  PLAYER_FRAME_WIDTH,
  PLAYER_SHEET_KEY,
  PLAYER_SHEET_URL,
} from '../art/playerArt'
import {
  LAB_MAP_KEY,
  LAB_MAP_URL,
  ROOM_TILESET_KEY,
  ROOM_TILESET_URL,
} from '../layout/labLayout'
import {
  LIVING_CORE_TEXTURE_KEY,
  LIVING_CORE_TEXTURE_URL,
} from '../art/livingCoreArt'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot')
  }

  preload() {
    this.load.tilemapTiledJSON(LAB_MAP_KEY, LAB_MAP_URL)
    this.load.image(ROOM_TILESET_KEY, ROOM_TILESET_URL)
    this.load.image(EXPERIENCE_ARCHIVE_TEXTURE_KEY, EXPERIENCE_ARCHIVE_TEXTURE_URL)
    this.load.image(LIVING_CORE_TEXTURE_KEY, LIVING_CORE_TEXTURE_URL)
    this.load.spritesheet(PLAYER_SHEET_KEY, PLAYER_SHEET_URL, {
      frameWidth: PLAYER_FRAME_WIDTH,
      frameHeight: PLAYER_FRAME_HEIGHT,
    })
  }

  create() {
    this.textures.get(EXPERIENCE_ARCHIVE_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(LIVING_CORE_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(PLAYER_SHEET_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(ROOM_TILESET_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)

    const pixel = this.add.graphics()
    pixel.fillStyle(0xffffff)
    pixel.fillRect(0, 0, 2, 2)
    pixel.generateTexture('pixel', 2, 2)
    pixel.destroy()

    this.scene.start('lab')
  }
}
