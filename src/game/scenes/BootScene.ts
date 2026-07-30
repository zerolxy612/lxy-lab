import Phaser from 'phaser'
import {
  EXPERIENCE_ARCHIVE_TEXTURE_KEY,
  EXPERIENCE_ARCHIVE_TEXTURE_URL,
} from '../art/experienceArchiveArt'
import {
  OFFLINE_CORNER_TEXTURE_KEY,
  OFFLINE_CORNER_TEXTURE_URL,
  RAG_PIPELINE_TEXTURE_KEY,
  RAG_PIPELINE_TEXTURE_URL,
} from '../art/environmentArt'
import {
  PLAYER_FRAME_HEIGHT,
  PLAYER_FRAME_WIDTH,
  PLAYER_SHEET_KEY,
  PLAYER_SHEET_URL,
} from '../art/playerArt'
import {
  ROOM_BACKGROUND_TEXTURE_KEY,
  ROOM_BACKGROUND_TEXTURE_URL,
} from '../art/roomBackgroundArt'
import {
  FUTURE_GATE_TEXTURE_KEY,
  FUTURE_GATE_TEXTURE_URL,
  LAB_COMPANION_TEXTURE_KEY,
  LAB_COMPANION_TEXTURE_URL,
  SELECTED_WORK_TEXTURE_KEY,
  SELECTED_WORK_TEXTURE_URL,
} from '../art/stationArt'
import {
  LAB_MAP_KEY,
  LAB_MAP_URL,
} from '../layout/labLayout'
import {
  LIVING_CORE_TEXTURE_KEY,
  LIVING_CORE_TEXTURE_URL,
} from '../art/livingCoreArt'
import { labBridge } from '../bridge'

export class BootScene extends Phaser.Scene {
  private loadFailed = false

  constructor() {
    super('boot')
  }

  preload() {
    this.loadFailed = false
    this.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
      this.loadFailed = true
      labBridge.emit('game:error', {
        message: 'The room assets did not finish loading.',
      })
    })

    this.load.tilemapTiledJSON(LAB_MAP_KEY, LAB_MAP_URL)
    this.load.image(ROOM_BACKGROUND_TEXTURE_KEY, ROOM_BACKGROUND_TEXTURE_URL)
    this.load.image(EXPERIENCE_ARCHIVE_TEXTURE_KEY, EXPERIENCE_ARCHIVE_TEXTURE_URL)
    this.load.image(LIVING_CORE_TEXTURE_KEY, LIVING_CORE_TEXTURE_URL)
    this.load.image(LAB_COMPANION_TEXTURE_KEY, LAB_COMPANION_TEXTURE_URL)
    this.load.image(SELECTED_WORK_TEXTURE_KEY, SELECTED_WORK_TEXTURE_URL)
    this.load.image(FUTURE_GATE_TEXTURE_KEY, FUTURE_GATE_TEXTURE_URL)
    this.load.image(RAG_PIPELINE_TEXTURE_KEY, RAG_PIPELINE_TEXTURE_URL)
    this.load.image(OFFLINE_CORNER_TEXTURE_KEY, OFFLINE_CORNER_TEXTURE_URL)
    this.load.spritesheet(PLAYER_SHEET_KEY, PLAYER_SHEET_URL, {
      frameWidth: PLAYER_FRAME_WIDTH,
      frameHeight: PLAYER_FRAME_HEIGHT,
    })
  }

  create() {
    if (this.loadFailed) return

    this.textures.get(EXPERIENCE_ARCHIVE_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(LIVING_CORE_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(PLAYER_SHEET_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(ROOM_BACKGROUND_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(LAB_COMPANION_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(SELECTED_WORK_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(FUTURE_GATE_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(RAG_PIPELINE_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.textures.get(OFFLINE_CORNER_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)

    const pixel = this.add.graphics()
    pixel.fillStyle(0xffffff)
    pixel.fillRect(0, 0, 2, 2)
    pixel.generateTexture('pixel', 2, 2)
    pixel.destroy()

    this.scene.start('lab')
  }
}
