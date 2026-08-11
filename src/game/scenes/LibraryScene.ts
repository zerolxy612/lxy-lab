import Phaser from 'phaser'
import { labBridge } from '../bridge'
import { LAB_HEIGHT, LAB_WIDTH } from '../dimensions'
import { Player } from '../entities/Player'
import {
  LIBRARY_MAP_KEY,
  LIBRARY_MAP_URL,
  parseLibraryMap,
  type LibraryInteraction,
  type LibraryInteractionId,
  type LibraryRectangle,
} from '../layout/libraryLayout'
import { transitionToRoom, type RoomTransitionData } from '../roomTransition'
import type { AvailableRoomId } from '../rooms'

interface InteractiveLibraryTarget {
  layout: LibraryInteraction
  zone: Phaser.GameObjects.Zone
  frame: Phaser.GameObjects.Rectangle
}

const prototypePostSlug = 'why-this-lab-uses-two-runtimes'

export class LibraryScene extends Phaser.Scene {
  private player!: Player
  private targets: InteractiveLibraryTarget[] = []
  private nearbyTarget: LibraryInteractionId | null = null
  private controlsEnabled = true
  private transitioning = false
  private reducedMotion = false
  private entryFrom: AvailableRoomId | null = null
  private interactKeys: Phaser.Input.Keyboard.Key[] = []
  private removeRoomRequestListener?: () => void
  private removeContentListener?: () => void

  constructor() {
    super('library')
  }

  init(data: RoomTransitionData) {
    this.entryFrom = data.entryFrom ?? null
    this.transitioning = false
    this.controlsEnabled = true
    this.nearbyTarget = null
    this.targets = []
  }

  preload() {
    if (!this.cache.tilemap.exists(LIBRARY_MAP_KEY)) {
      this.load.tilemapTiledJSON(LIBRARY_MAP_KEY, LIBRARY_MAP_URL)
    }
  }

  create() {
    try {
      const cachedMap = this.cache.tilemap.get(LIBRARY_MAP_KEY) as { data?: unknown } | undefined
      const layout = parseLibraryMap(cachedMap?.data)
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      this.drawPrototypeRoom()
      this.physics.world.setBounds(
        layout.worldBounds.x - layout.worldBounds.width / 2,
        layout.worldBounds.y - layout.worldBounds.height / 2,
        layout.worldBounds.width,
        layout.worldBounds.height,
      )
      this.player = new Player(this, layout.playerSpawn.x, layout.playerSpawn.y)
      layout.collision.forEach((rectangle) => {
        this.physics.add.collider(this.player, this.createStaticBlock(rectangle))
      })
      this.targets = layout.interactions.map((interaction) => this.createTarget(interaction))
      this.interactKeys = [
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      ]

      this.removeRoomRequestListener = labBridge.on('room:request', ({ roomId }) => {
        if (roomId === 'library' || this.transitioning) return
        this.transitioning = transitionToRoom(this, 'library', roomId, this.reducedMotion)
      })
      this.removeContentListener = labBridge.on('ui:room-content-change', ({ open }) => {
        this.controlsEnabled = !open && !this.transitioning
      })
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.removeRoomRequestListener?.()
        this.removeContentListener?.()
        labBridge.emit('room:nearby', { roomId: 'library', targetId: null, label: null })
      })

      if (this.entryFrom && !this.reducedMotion) this.cameras.main.fadeIn(260, 7, 9, 22)
      labBridge.emit('room:entered', { roomId: 'library', from: this.entryFrom })
      labBridge.emit('game:loading', { phase: 'ready', progress: 1 })
      labBridge.emit('game:ready', {})
    } catch (error) {
      console.error('Archive Library prototype failed to initialise.', error)
      labBridge.emit('room:error', {
        roomId: 'library',
        message: 'The Archive Library prototype could not be prepared.',
      })
      labBridge.emit('game:error', {
        message: 'The Archive Library prototype could not be prepared.',
      })
    }
  }

  update() {
    this.player.move(this.controlsEnabled)
    this.updateNearbyTarget()
  }

  private drawPrototypeRoom() {
    this.cameras.main.setBackgroundColor('#090914')

    const backdrop = this.add.graphics().setDepth(0)
    backdrop.fillStyle(0x090914)
    backdrop.fillRect(0, 0, LAB_WIDTH, LAB_HEIGHT)
    backdrop.fillStyle(0x131321)
    backdrop.fillRect(58, 72, 844, 428)
    backdrop.fillStyle(0x171421)
    backdrop.fillRect(58, 174, 94, 180)
    backdrop.fillRect(808, 174, 94, 180)

    const floor = this.add.graphics().setDepth(1)
    floor.lineStyle(1, 0x6e5a46, 0.18)
    for (let y = 190; y <= 500; y += 32) floor.lineBetween(58, y, 902, y)
    for (let x = 72; x <= 888; x += 64) floor.lineBetween(x, 174, x, 500)

    this.drawShelves()
    this.drawReadingTable()
    this.drawCatalog()
    this.drawExit()

    this.add.text(72, 88, 'ARCHIVE LIBRARY / PROTOTYPE', {
      color: '#ffc45c',
      fontFamily: 'sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      letterSpacing: 2,
    }).setDepth(900)
    this.add.text(72, 108, 'ONE REAL NOTE · THREE INTERACTION ANCHORS', {
      color: '#776f7d',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      letterSpacing: 1.5,
    }).setDepth(900)
    this.add.text(LAB_WIDTH - 72, LAB_HEIGHT - 30, 'RETURN / MAIN LAB', {
      color: '#766b79',
      fontFamily: 'sans-serif',
      fontSize: '8px',
      letterSpacing: 1.5,
    }).setOrigin(1, 0).setDepth(900)
  }

  private drawShelves() {
    const shelves = this.add.container(0, 0).setDepth(120)
    const colors = [0x6c4050, 0x8e673d, 0x3e5964, 0x594b72, 0x77634a]

    for (let section = 0; section < 7; section += 1) {
      const x = 82 + section * 120
      shelves.add(this.add.rectangle(x, 142, 104, 66, 0x11101b)
        .setStrokeStyle(2, 0x5e4d40, 0.7))
      shelves.add(this.add.rectangle(x, 165, 104, 4, 0x79654e, 0.72))
      for (let book = 0; book < 9; book += 1) {
        const height = 20 + ((section * 7 + book * 5) % 19)
        shelves.add(this.add.rectangle(
          x - 43 + book * 10,
          161 - height / 2,
          6 + (book % 2),
          height,
          colors[(section + book) % colors.length],
          0.82,
        ))
      }
    }

    this.add.rectangle(480, 174, 844, 5, 0x8e6a43, 0.42).setDepth(130)
    this.add.rectangle(480, 186, 650, 42, 0xffc45c, 0.025)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(20)
  }

  private drawReadingTable() {
    const table = this.add.container(480, 303).setDepth(303)
    const light = this.add.ellipse(0, -30, 250, 150, 0xffc45c, 0.07)
      .setBlendMode(Phaser.BlendModes.ADD)
    const top = this.add.rectangle(0, 0, 180, 46, 0x382b28)
      .setStrokeStyle(2, 0x826044, 0.72)
    const bookLeft = this.add.rectangle(-22, -8, 42, 27, 0xe2c58f)
      .setStrokeStyle(1, 0x805f3b, 0.8)
    const bookRight = this.add.rectangle(22, -8, 42, 27, 0xd3b77f)
      .setStrokeStyle(1, 0x805f3b, 0.8)
    const spine = this.add.rectangle(0, -8, 2, 27, 0x72563c)
    const lampStem = this.add.rectangle(65, -29, 3, 30, 0x8b745a)
    const lamp = this.add.triangle(65, -48, -12, 10, 12, 10, 0, -8, 0xffc45c, 0.85)
    table.add([light, top, bookLeft, bookRight, spine, lampStem, lamp])

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: light,
        alpha: { from: 0.045, to: 0.1 },
        duration: 2600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }
  }

  private drawCatalog() {
    const catalog = this.add.container(720, 382).setDepth(382)
    const body = this.add.rectangle(0, 0, 96, 62, 0x171824)
      .setStrokeStyle(2, 0x8a6a45, 0.72)
    const screen = this.add.rectangle(0, -7, 66, 26, 0x18252a)
      .setStrokeStyle(1, 0xffc45c, 0.58)
    const line1 = this.add.rectangle(-8, -11, 34, 2, 0xffc45c, 0.72)
    const line2 = this.add.rectangle(3, -4, 48, 2, 0x76b9ba, 0.42)
    const slot = this.add.rectangle(0, 20, 38, 3, 0x7c6045, 0.7)
    catalog.add([body, screen, line1, line2, slot])
  }

  private drawExit() {
    const exit = this.add.container(480, 476).setDepth(60)
    exit.add(this.add.rectangle(0, 0, 112, 36, 0x0c111c)
      .setStrokeStyle(1, 0x5cdfff, 0.5))
    exit.add(this.add.rectangle(0, -18, 46, 2, 0x5cdfff, 0.85))
    exit.add(this.add.text(0, -3, 'TO MAIN LAB', {
      color: '#8edeee',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      letterSpacing: 1.5,
    }).setOrigin(0.5))
  }

  private createStaticBlock(rectangle: LibraryRectangle) {
    return this.physics.add.staticImage(rectangle.x, rectangle.y, 'pixel')
      .setDisplaySize(rectangle.width, rectangle.height)
      .setAlpha(0)
      .refreshBody()
  }

  private createTarget(layout: LibraryInteraction): InteractiveLibraryTarget {
    const frame = this.add.rectangle(layout.x, layout.y, layout.width, layout.height)
      .setStrokeStyle(1, layout.id === 'exit' ? 0x5cdfff : 0xffc45c, 0.16)
      .setDepth(1000)
    const zone = this.add.zone(layout.x, layout.y, layout.width, layout.height)
      .setInteractive({ useHandCursor: true })
    const accent = layout.id === 'exit' ? 0x5cdfff : 0xffc45c
    zone.on('pointerover', () => frame.setAlpha(1).setStrokeStyle(2, accent, 0.82))
    zone.on('pointerout', () => frame.setAlpha(1).setStrokeStyle(1, accent, 0.16))
    zone.on('pointerdown', () => {
      if (this.controlsEnabled) this.activateTarget(layout.id)
    })
    return { layout, zone, frame }
  }

  private updateNearbyTarget() {
    const playerBounds = this.player.getBounds()
    const next = this.controlsEnabled
      ? this.targets.find(({ zone }) => (
        Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, zone.getBounds())
      ))
      : undefined
    const nextId = next?.layout.id ?? null

    if (nextId !== this.nearbyTarget) {
      this.nearbyTarget = nextId
      labBridge.emit('room:nearby', {
        roomId: 'library',
        targetId: nextId,
        label: next?.layout.label ?? null,
      })
      this.targets.forEach(({ layout, frame }) => {
        frame.setStrokeStyle(
          layout.id === nextId ? 2 : 1,
          layout.id === 'exit' ? 0x5cdfff : 0xffc45c,
          layout.id === nextId ? 0.82 : 0.16,
        )
      })
    }

    if (
      nextId
      && this.interactKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))
    ) {
      this.activateTarget(nextId)
    }
  }

  private activateTarget(targetId: LibraryInteractionId) {
    if (targetId === 'exit') {
      if (!this.transitioning) {
        this.transitioning = transitionToRoom(this, 'library', 'lab', this.reducedMotion)
        this.controlsEnabled = false
      }
      return
    }
    labBridge.emit('library:open', {
      surface: targetId === 'catalog' ? 'catalog' : 'article',
      slug: targetId === 'reading' ? prototypePostSlug : undefined,
    })
  }
}
