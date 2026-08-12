import Phaser from 'phaser'
import { ARCHIVE_CORRIDOR_TEXTURE_KEY } from '../art/archiveDoorArt'
import { labBridge } from '../bridge'
import { LAB_HEIGHT, LAB_WIDTH } from '../dimensions'
import { Player } from '../entities/Player'
import { roomById, type AvailableRoomId } from '../rooms'

export interface ArchiveCorridorData {
  from: AvailableRoomId
  to: AvailableRoomId
}

const corridorBounds = {
  left: 170,
  right: 840,
  top: 280,
  bottom: 372,
}

export class ArchiveCorridorScene extends Phaser.Scene {
  private player!: Player
  private from: AvailableRoomId = 'lab'
  private to: AvailableRoomId = 'library'
  private leaving = false

  constructor() {
    super('archive-corridor')
  }

  init(data: ArchiveCorridorData) {
    this.from = data.from
    this.to = data.to
    this.leaving = false
  }

  create() {
    const enteringArchive = this.to === 'library'
    this.cameras.main.setBackgroundColor('#03050c')
    this.drawThreshold(enteringArchive)

    this.physics.world.setBounds(
      corridorBounds.left,
      corridorBounds.top,
      corridorBounds.right - corridorBounds.left,
      corridorBounds.bottom - corridorBounds.top,
    )
    this.player = new Player(
      this,
      enteringArchive ? corridorBounds.right - 28 : corridorBounds.left + 64,
      326,
    )
    this.player.setCollideWorldBounds(true)

    this.cameras.main.fadeIn(220, 3, 5, 12)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      labBridge.emit('room:nearby', {
        roomId: this.from,
        targetId: null,
        label: null,
      })
    })
  }

  update() {
    if (this.leaving) {
      this.player.move(false)
      return
    }

    this.player.move(true)
    this.player.y = Phaser.Math.Clamp(this.player.y, corridorBounds.top + 24, corridorBounds.bottom - 10)

    const enteringArchive = this.to === 'library'
    const reachedThreshold = enteringArchive
      ? this.player.x <= corridorBounds.left + 40
      : this.player.x >= corridorBounds.right - 20

    if (reachedThreshold) this.finishTransfer()
  }

  private drawThreshold(enteringArchive: boolean) {
    const backdrop = this.add.image(LAB_WIDTH / 2, LAB_HEIGHT / 2, ARCHIVE_CORRIDOR_TEXTURE_KEY)
      .setDepth(0)
    const thresholdGlow = this.add.ellipse(210, 324, 240, 132, 0xffc45c, 0.035)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(1)
    const arrivalGlow = this.add.ellipse(818, 330, 160, 118, 0x5cdfff, 0.035)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(1)

    this.drawRouteGuidance(enteringArchive)
    this.drawStatusChrome(enteringArchive)
    this.drawAtmosphere(enteringArchive, thresholdGlow, arrivalGlow, backdrop)
  }

  private drawRouteGuidance(enteringArchive: boolean) {
    const routeY = 374
    const routeStart = 220
    const routeEnd = 816
    const pulse = this.add.rectangle(
      enteringArchive ? routeEnd : routeStart,
      routeY,
      28,
      2,
      0xa9efff,
      0.72,
    ).setDepth(9).setBlendMode(Phaser.BlendModes.ADD)
    this.tweens.add({
      targets: pulse,
      x: enteringArchive ? routeStart : routeEnd,
      alpha: { from: 0.12, to: 0.82 },
      duration: 1_500,
      repeat: -1,
      ease: 'Cubic.InOut',
    })
  }

  private drawStatusChrome(enteringArchive: boolean) {
    const destination = enteringArchive ? 'ARCHIVE LIBRARY' : 'MAIN LAB'
    const direction = enteringArchive ? '←' : '→'
    const instruction = enteringArchive ? 'MOVE LEFT TO ENTER' : 'MOVE RIGHT TO RETURN'

    const header = this.add.container(72, 62).setDepth(20)
    header.add(this.add.rectangle(0, 0, 3, 46, 0xffc45c, 0.9).setOrigin(0, 0.5))
    header.add(this.add.text(16, -17, 'A–02 / INTERNAL TRANSFER', {
      color: '#ffc45c',
      fontFamily: 'sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0, 0.5))
    header.add(this.add.text(16, 9, `${destination}  ${direction}`, {
      color: '#dce7ff',
      fontFamily: 'sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0, 0.5))

    this.add.text(888, 58, 'ROUTE CLEAR\nLOCAL CONTROL', {
      align: 'right',
      color: '#66809e',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      letterSpacing: 1.5,
      lineSpacing: 6,
    }).setOrigin(1, 0).setDepth(20)

    const footer = this.add.container(480, 500).setDepth(20)
    footer.add(this.add.rectangle(0, 0, 816, 34, 0x050914, 0.94)
      .setStrokeStyle(1, 0x263a57, 0.88))
    footer.add(this.add.text(-386, 0, `${roomById[this.from].label}  /  ${roomById[this.to].label}`, {
      color: '#657999',
      fontFamily: 'sans-serif',
      fontSize: '8px',
      letterSpacing: 1,
    }).setOrigin(0, 0.5))
    footer.add(this.add.text(0, 0, instruction, {
      color: '#a6efff',
      fontFamily: 'sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setOrigin(0.5))
    footer.add(this.add.text(386, 0, 'WASD / ARROWS', {
      color: '#ffc45c',
      fontFamily: 'sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      letterSpacing: 1.5,
    }).setOrigin(1, 0.5))
  }

  private drawAtmosphere(
    enteringArchive: boolean,
    thresholdGlow: Phaser.GameObjects.Ellipse,
    arrivalGlow: Phaser.GameObjects.Ellipse,
    backdrop: Phaser.GameObjects.Image,
  ) {
    const doorSignal = this.add.rectangle(126, 280, 4, 58, 0xffc45c, 0.16)
      .setDepth(8)
      .setBlendMode(Phaser.BlendModes.ADD)
    backdrop.setAlpha(0.62).setX(enteringArchive ? LAB_WIDTH / 2 + 6 : LAB_WIDTH / 2 - 6)
    this.tweens.add({
      targets: backdrop,
      x: LAB_WIDTH / 2,
      alpha: 1,
      duration: 420,
      ease: 'Cubic.Out',
    })
    this.tweens.add({
      targets: [thresholdGlow, doorSignal, arrivalGlow],
      alpha: { from: 0.025, to: 0.09 },
      duration: 1_900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    })

    for (let index = 0; index < 9; index += 1) {
      const dust = this.add.rectangle(
        180 + ((index * 83) % 650),
        252 + ((index * 37) % 126),
        index % 3 === 0 ? 2 : 1,
        1,
        0x9fdcec,
        0.14,
      ).setDepth(7)
      this.tweens.add({
        targets: dust,
        x: dust.x + (enteringArchive ? -22 : 22),
        alpha: 0.02,
        duration: 1_800 + index * 130,
        delay: index * 110,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }
  }

  private finishTransfer() {
    if (this.leaving) return
    this.leaving = true

    const startDestination = () => {
      this.scene.start(roomById[this.to].sceneKey, { entryFrom: this.from })
    }
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, startDestination)
    this.cameras.main.fadeOut(220, 3, 5, 12)
  }
}
