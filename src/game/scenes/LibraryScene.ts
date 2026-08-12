import Phaser from 'phaser'
import {
  LIBRARY_BACKGROUND_TEXTURE_KEY,
  LIBRARY_BACKGROUND_TEXTURE_URL,
  LIBRARY_CATALOG_TERMINAL_TEXTURE_KEY,
  LIBRARY_CATALOG_TERMINAL_TEXTURE_URL,
  LIBRARY_READING_TABLE_TEXTURE_KEY,
  LIBRARY_READING_TABLE_TEXTURE_URL,
} from '../art/libraryArt'
import { labBridge } from '../bridge'
import { LAB_HEIGHT, LAB_WIDTH } from '../dimensions'
import { LibraryTransferDoor } from '../entities/LibraryTransferDoor'
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
  private contentOpen = false
  private quickAccessOpen = false
  private transitioning = false
  private reducedMotion = false
  private entryFrom: AvailableRoomId | null = null
  private transferDoor?: LibraryTransferDoor
  private interactKeys: Phaser.Input.Keyboard.Key[] = []
  private removeRoomRequestListener?: () => void
  private removeContentListener?: () => void
  private removeIndexListener?: () => void

  constructor() {
    super('library')
  }

  init(data: RoomTransitionData) {
    this.entryFrom = data.entryFrom ?? null
    this.transitioning = false
    this.controlsEnabled = true
    this.contentOpen = false
    this.quickAccessOpen = false
    this.nearbyTarget = null
    this.targets = []
  }

  preload() {
    if (!this.cache.tilemap.exists(LIBRARY_MAP_KEY)) {
      this.load.tilemapTiledJSON(LIBRARY_MAP_KEY, LIBRARY_MAP_URL)
    }
    if (!this.textures.exists(LIBRARY_BACKGROUND_TEXTURE_KEY)) {
      this.load.image(LIBRARY_BACKGROUND_TEXTURE_KEY, LIBRARY_BACKGROUND_TEXTURE_URL)
    }
    if (!this.textures.exists(LIBRARY_READING_TABLE_TEXTURE_KEY)) {
      this.load.image(LIBRARY_READING_TABLE_TEXTURE_KEY, LIBRARY_READING_TABLE_TEXTURE_URL)
    }
    if (!this.textures.exists(LIBRARY_CATALOG_TERMINAL_TEXTURE_KEY)) {
      this.load.image(LIBRARY_CATALOG_TERMINAL_TEXTURE_KEY, LIBRARY_CATALOG_TERMINAL_TEXTURE_URL)
    }
  }

  create() {
    try {
      const cachedMap = this.cache.tilemap.get(LIBRARY_MAP_KEY) as { data?: unknown } | undefined
      const layout = parseLibraryMap(cachedMap?.data)
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      this.textures.get(LIBRARY_BACKGROUND_TEXTURE_KEY).setFilter(Phaser.Textures.FilterMode.NEAREST)
      this.textures.get(LIBRARY_READING_TABLE_TEXTURE_KEY)
        .setFilter(Phaser.Textures.FilterMode.NEAREST)
      this.textures.get(LIBRARY_CATALOG_TERMINAL_TEXTURE_KEY)
        .setFilter(Phaser.Textures.FilterMode.NEAREST)
      this.drawLibraryRoom()
      this.physics.world.setBounds(
        layout.worldBounds.x - layout.worldBounds.width / 2,
        layout.worldBounds.y - layout.worldBounds.height / 2,
        layout.worldBounds.width,
        layout.worldBounds.height,
      )
      const exitLayout = layout.interactions.find(({ id }) => id === 'exit')
      if (exitLayout) {
        this.transferDoor = new LibraryTransferDoor(this, exitLayout, this.reducedMotion)
      }
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
        this.contentOpen = open
        this.refreshControlsEnabled()
      })
      this.removeIndexListener = labBridge.on('ui:index-change', ({ open }) => {
        this.quickAccessOpen = open
        this.refreshControlsEnabled()
      })
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.removeRoomRequestListener?.()
        this.removeContentListener?.()
        this.removeIndexListener?.()
        labBridge.emit('room:nearby', { roomId: 'library', targetId: null, label: null })
      })

      if (this.entryFrom && !this.reducedMotion) this.cameras.main.fadeIn(260, 7, 9, 22)
      if (this.entryFrom === 'lab') this.transferDoor?.playArrival()
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

  private drawLibraryRoom() {
    this.cameras.main.setBackgroundColor('#090914')

    this.add.image(LAB_WIDTH / 2, LAB_HEIGHT / 2, LIBRARY_BACKGROUND_TEXTURE_KEY)
      .setDepth(0)

    this.drawReadingTable()
    this.drawCatalog()
  }

  private drawReadingTable() {
    const light = this.add.ellipse(468, 282, 220, 116, 0xffc45c, 0.055)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(270)
    this.add.image(480, 303, LIBRARY_READING_TABLE_TEXTURE_KEY)
      .setDepth(303)

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: light,
        alpha: { from: 0.035, to: 0.075 },
        duration: 2600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }
  }

  private drawCatalog() {
    const screenGlow = this.add.ellipse(720, 330, 86, 78, 0x5cdfff, 0.035)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(360)
    this.add.image(720, 382, LIBRARY_CATALOG_TERMINAL_TEXTURE_KEY)
      .setOrigin(0.5, 0.68)
      .setDepth(382)

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: screenGlow,
        alpha: { from: 0.02, to: 0.055 },
        duration: 2100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
    }
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
      .setAlpha(0)
      .setDepth(1000)
    const zone = this.add.zone(layout.x, layout.y, layout.width, layout.height)
      .setInteractive({ useHandCursor: true })
    const accent = layout.id === 'exit' ? 0x5cdfff : 0xffc45c
    zone.on('pointerover', () => frame.setAlpha(1).setStrokeStyle(2, accent, 0.82))
    zone.on('pointerout', () => {
      const nearby = this.nearbyTarget === layout.id
      frame.setAlpha(nearby ? 1 : 0).setStrokeStyle(nearby ? 2 : 1, accent, nearby ? 0.82 : 0.16)
    })
    zone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.controlsEnabled && pointer.event?.target === this.game.canvas) {
        this.activateTarget(layout.id)
      }
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
        frame.setAlpha(layout.id === nextId ? 1 : 0)
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
        this.transitioning = this.transferDoor?.open(() => {
          transitionToRoom(this, 'library', 'lab', this.reducedMotion)
        }) ?? transitionToRoom(this, 'library', 'lab', this.reducedMotion)
        this.refreshControlsEnabled()
      }
      return
    }
    labBridge.emit('library:open', {
      surface: targetId === 'catalog' ? 'catalog' : 'article',
      slug: targetId === 'reading' ? prototypePostSlug : undefined,
    })
  }

  private refreshControlsEnabled() {
    this.controlsEnabled = !this.contentOpen
      && !this.quickAccessOpen
      && !this.transitioning
  }
}
