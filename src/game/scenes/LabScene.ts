import Phaser from 'phaser'
import type { StationId } from '../../content/stations'
import { stationById } from '../../content/stations'
import { labBridge } from '../bridge'
import { LAB_HEIGHT, LAB_WIDTH } from '../config'
import { Player } from '../entities/Player'
import {
  InteractionSystem,
  type InteractiveStation,
} from '../systems/InteractionSystem'

interface StationLayout {
  id: StationId
  x: number
  y: number
  width: number
  height: number
  color: number
}

const stationLayouts: readonly StationLayout[] = [
  { id: 'assistant', x: 185, y: 145, width: 112, height: 72, color: 0xcd55ff },
  { id: 'experience', x: 155, y: 290, width: 190, height: 112, color: 0x5cdfff },
  { id: 'systems', x: 480, y: 145, width: 176, height: 112, color: 0x5cdfff },
  { id: 'projects', x: 795, y: 255, width: 190, height: 112, color: 0xcd55ff },
  { id: 'future', x: 790, y: 420, width: 132, height: 78, color: 0xffc45c },
]

export class LabScene extends Phaser.Scene {
  private player!: Player
  private interactionSystem!: InteractionSystem
  private controlsEnabled = true
  private removePanelListener?: () => void

  constructor() {
    super('lab')
  }

  create() {
    this.physics.world.setBounds(48, 68, LAB_WIDTH - 96, LAB_HEIGHT - 110)
    this.drawRoom()

    this.player = new Player(this, LAB_WIDTH / 2, LAB_HEIGHT - 92)
    const stations = stationLayouts.map((layout) => this.createStation(layout))

    this.interactionSystem = new InteractionSystem(this, this.player, stations)
    this.removePanelListener = labBridge.on('ui:panel-change', ({ open }) => {
      this.controlsEnabled = !open
    })

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.removePanelListener?.()
    })
  }

  update() {
    this.player.move(this.controlsEnabled)
    this.interactionSystem.update(this.controlsEnabled)
  }

  private drawRoom() {
    this.cameras.main.setBackgroundColor('#070916')

    const room = this.add.graphics()
    room.fillStyle(0x10152a)
    room.fillRect(48, 68, LAB_WIDTH - 96, LAB_HEIGHT - 110)
    room.lineStyle(2, 0x304064, 0.9)
    room.strokeRect(48, 68, LAB_WIDTH - 96, LAB_HEIGHT - 110)

    for (let x = 64; x < LAB_WIDTH - 48; x += 32) {
      room.lineBetween(x, 68, x, LAB_HEIGHT - 42)
    }

    for (let y = 84; y < LAB_HEIGHT - 42; y += 32) {
      room.lineBetween(48, y, LAB_WIDTH - 48, y)
    }

    room.setAlpha(0.55)

    this.add.text(70, 88, 'GREYBOX LAB // MOVEMENT PROTOTYPE', {
      color: '#7783a6',
      fontFamily: 'sans-serif',
      fontSize: '12px',
      letterSpacing: 2,
    })
  }

  private createStation(layout: StationLayout): InteractiveStation {
    const { id, x, y, width, height, color } = layout
    const content = stationById[id]
    const obstacle = this.physics.add.staticImage(x, y, 'pixel')
      .setDisplaySize(width, height)
      .setTint(0x171d37)
      .refreshBody()

    this.physics.add.collider(this.player, obstacle)

    const outline = this.add.rectangle(x, y, width, height)
      .setStrokeStyle(2, color, 0.8)
      .setDepth(5)
      .setInteractive({ useHandCursor: true })

    this.add.text(x - width / 2 + 12, y - height / 2 + 12, content.index, {
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontFamily: 'sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
    }).setDepth(6)

    this.add.text(x - width / 2 + 12, y - 4, content.title.toUpperCase(), {
      color: '#d9e2ff',
      fontFamily: 'sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
    }).setDepth(6)

    const zone = this.add.zone(x, y, width + 58, height + 58)
    outline.on('pointerdown', () => {
      labBridge.emit('station:activate', { stationId: id })
    })

    return { id, zone }
  }
}
