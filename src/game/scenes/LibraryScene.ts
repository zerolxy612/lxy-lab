import Phaser from 'phaser'
import { blogPosts, featuredBlogPost } from '../../content/blog'
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
import { selectReturnPost } from '../libraryAtmosphere'
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
}

interface LibraryTargetVisual {
  glow: Phaser.GameObjects.Ellipse
  signal: Phaser.GameObjects.Rectangle
  sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle
  label?: Phaser.GameObjects.Text
}

export class LibraryScene extends Phaser.Scene {
  private player!: Player
  private targets: InteractiveLibraryTarget[] = []
  private readonly targetVisuals = new Map<LibraryInteractionId, LibraryTargetVisual>()
  private nearbyTarget: LibraryInteractionId | null = null
  private hoveredTarget: LibraryInteractionId | null = null
  private controlsEnabled = true
  private contentOpen = false
  private quickAccessOpen = false
  private transitioning = false
  private reducedMotion = false
  private entryFrom: AvailableRoomId | null = null
  private transferDoor?: LibraryTransferDoor
  private layout!: ReturnType<typeof parseLibraryMap>
  private debugVisible = false
  private debugKey!: Phaser.Input.Keyboard.Key
  private debugGraphics!: Phaser.GameObjects.Graphics
  private debugLabel!: Phaser.GameObjects.Text
  private returnCursor = 0
  private returnSlip?: Phaser.GameObjects.Rectangle
  private returnLabel?: Phaser.GameObjects.Text
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
    this.hoveredTarget = null
    this.targets = []
    this.targetVisuals.clear()
    this.returnCursor = 0
    this.debugVisible = false
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
      this.layout = layout
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
      this.createDebugOverlay()

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
    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      this.debugVisible = !this.debugVisible
      this.renderDebugOverlay()
    }
  }

  private drawLibraryRoom() {
    this.cameras.main.setBackgroundColor('#090914')

    this.add.image(LAB_WIDTH / 2, LAB_HEIGHT / 2, LIBRARY_BACKGROUND_TEXTURE_KEY)
      .setDepth(0)

    this.drawReadingTable()
    this.drawCatalog()
    this.drawReturnSlot()
    this.drawArchiveActivity()
  }

  private drawReadingTable() {
    const light = this.add.ellipse(468, 282, 220, 116, 0xffc45c, 0.055)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(270)
    const focusGlow = this.add.ellipse(480, 319, 176, 62, 0xffc45c, 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(298)
    const sprite = this.add.image(480, 303, LIBRARY_READING_TABLE_TEXTURE_KEY)
      .setDepth(303)
    const signal = this.add.rectangle(480, 278, 42, 2, 0xffc45c, 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(304)
    const label = this.add.text(480, 252, `FEATURED / ${featuredBlogPost.index}`, {
      color: '#d7b365',
      fontFamily: 'sans-serif',
      fontSize: '7px',
      fontStyle: 'bold',
      letterSpacing: 1.05,
    }).setOrigin(0.5).setAlpha(0.7).setDepth(305)
    this.targetVisuals.set('reading', { glow: focusGlow, signal, sprite, label })

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
    const focusGlow = this.add.ellipse(720, 388, 76, 112, 0x5cdfff, 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(374)
    const sprite = this.add.image(720, 382, LIBRARY_CATALOG_TERMINAL_TEXTURE_KEY)
      .setOrigin(0.5, 0.68)
      .setDepth(382)
    const signal = this.add.rectangle(720, 335, 28, 2, 0x5cdfff, 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(383)
    const label = this.add.text(720, 320, `CATALOG / ${blogPosts.length} RECORDS`, {
      color: '#72bacd',
      fontFamily: 'sans-serif',
      fontSize: '6px',
      fontStyle: 'bold',
      letterSpacing: 0.8,
    }).setOrigin(0.5).setAlpha(0.55).setDepth(384)
    const scan = this.add.rectangle(720, 347, 30, 1, 0x7cecff, this.reducedMotion ? 0.16 : 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(384)
    this.targetVisuals.set('catalog', { glow: focusGlow, signal, sprite, label })

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: screenGlow,
        alpha: { from: 0.02, to: 0.055 },
        duration: 2100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      })
      this.tweens.add({
        targets: scan,
        y: { from: 347, to: 363 },
        alpha: { from: 0, to: 0.42 },
        duration: 920,
        hold: 100,
        yoyo: true,
        repeat: -1,
        repeatDelay: 3600,
        ease: 'Quart.Out',
      })
    }
  }

  private drawReturnSlot() {
    const post = selectReturnPost(blogPosts, this.returnCursor)
    if (!post) return
    const glow = this.add.ellipse(160, 328, 76, 48, 0xffa95c, 0)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(334)
    const panel = this.add.rectangle(156, 327, 46, 18, 0x17151a, 0.64)
      .setDepth(340)
    const slot = this.add.rectangle(156, 324, 30, 2, 0xc98745, 0.68)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(341)
    this.returnSlip = this.add.rectangle(156, 329, 21, 7, 0xd2b67f, 0.72)
      .setDepth(339)
    this.returnLabel = this.add.text(172, 340, `RETURN / ${post.index}`, {
      color: '#b88b55',
      fontFamily: 'sans-serif',
      fontSize: '6px',
      fontStyle: 'bold',
      letterSpacing: 0.75,
    }).setOrigin(0.5).setAlpha(0.24).setDepth(342)
    this.targetVisuals.set('return', { glow, signal: slot, sprite: panel, label: this.returnLabel })

    if (!this.reducedMotion) {
      this.tweens.add({
        targets: this.returnSlip,
        y: { from: 327, to: 331 },
        alpha: { from: 0.42, to: 0.78 },
        duration: 1250,
        yoyo: true,
        repeat: -1,
        repeatDelay: 5200,
        ease: 'Sine.InOut',
      })
    }
  }

  private drawArchiveActivity() {
    const indicators = [330, 480, 630].map((x, index) => (
      this.add.rectangle(x, 176, 18, 2, index === 1 ? 0xffbd62 : 0xc88448, this.reducedMotion ? 0.12 : 0)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(180)
    ))
    if (this.reducedMotion) return
    indicators.forEach((indicator, index) => {
      this.tweens.add({
        targets: indicator,
        alpha: { from: 0.04, to: index === 1 ? 0.28 : 0.18 },
        scaleX: { from: 0.35, to: 1 },
        duration: 420,
        delay: 120 + index * 130,
        hold: 520,
        yoyo: true,
        repeat: -1,
        repeatDelay: 7200 + index * 900,
        ease: 'Quart.Out',
      })
    })
  }

  private createStaticBlock(rectangle: LibraryRectangle) {
    return this.physics.add.staticImage(rectangle.x, rectangle.y, 'pixel')
      .setDisplaySize(rectangle.width, rectangle.height)
      .setAlpha(0)
      .refreshBody()
  }

  private createTarget(layout: LibraryInteraction): InteractiveLibraryTarget {
    const zone = this.add.zone(layout.x, layout.y, layout.width, layout.height)
      .setInteractive({ useHandCursor: true })
    zone.on('pointerover', () => {
      this.hoveredTarget = layout.id
      this.refreshTargetVisuals()
    })
    zone.on('pointerout', () => {
      if (this.hoveredTarget === layout.id) this.hoveredTarget = null
      this.refreshTargetVisuals()
    })
    zone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.controlsEnabled && pointer.event?.target === this.game.canvas) {
        this.activateTarget(layout.id)
      }
    })
    return { layout, zone }
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
        label: next ? this.getTargetLabel(next.layout) : null,
      })
      this.refreshTargetVisuals()
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
    if (targetId === 'return') {
      const post = selectReturnPost(blogPosts, this.returnCursor)
      if (!post) return
      this.returnCursor += 1
      const nextPost = selectReturnPost(blogPosts, this.returnCursor)
      if (nextPost) this.returnLabel?.setText(`RETURN / ${nextPost.index}`)
      labBridge.emit('library:open', { surface: 'article', slug: post.slug })
      return
    }
    labBridge.emit('library:open', {
      surface: targetId === 'catalog' ? 'catalog' : 'article',
      slug: targetId === 'reading' ? featuredBlogPost.slug : undefined,
    })
  }

  private refreshControlsEnabled() {
    this.controlsEnabled = !this.contentOpen
      && !this.quickAccessOpen
      && !this.transitioning
  }

  private refreshTargetVisuals() {
    const focusedTarget = this.hoveredTarget ?? this.nearbyTarget
    this.targetVisuals.forEach((visual, id) => {
      const focused = id === focusedTarget
      this.tweens.killTweensOf([visual.glow, visual.signal, visual.sprite, visual.label])
      const duration = this.reducedMotion ? 0 : 150
      this.tweens.add({
        targets: visual.glow,
        alpha: focused ? (id === 'reading' ? 0.22 : 0.18) : 0,
        scaleX: focused ? 1.08 : 1,
        scaleY: focused ? 1.08 : 1,
        duration,
        ease: 'Quad.Out',
      })
      this.tweens.add({
        targets: visual.signal,
        alpha: focused ? 0.92 : (id === 'return' ? 0.35 : 0),
        scaleX: focused ? 1.25 : 1,
        duration,
        ease: 'Quad.Out',
      })
      this.tweens.add({
        targets: visual.sprite,
        scaleX: focused ? 1.012 : 1,
        scaleY: focused ? 1.012 : 1,
        duration,
        ease: 'Quad.Out',
      })
      if (visual.label) {
        const idleAlpha = id === 'reading' ? 0.7 : id === 'catalog' ? 0.55 : 0.24
        this.tweens.add({
          targets: visual.label,
          alpha: focused ? 1 : idleAlpha,
          duration,
          ease: 'Quad.Out',
        })
      }
    })
    this.transferDoor?.setFocused(focusedTarget === 'exit')
  }

  private getTargetLabel(layout: LibraryInteraction) {
    if (layout.id === 'reading') return `Read ${featuredBlogPost.index}`
    if (layout.id === 'return') {
      const post = selectReturnPost(blogPosts, this.returnCursor)
      return post ? `Recover ${post.index}` : layout.label
    }
    return layout.label
  }

  private createDebugOverlay() {
    this.debugKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F2)
    this.debugGraphics = this.add.graphics().setDepth(2000).setVisible(false)
    this.debugLabel = this.add.text(LAB_WIDTH - 68, LAB_HEIGHT - 31, 'F2 / DEBUG', {
      color: '#586687',
      fontFamily: 'sans-serif',
      fontSize: '9px',
      letterSpacing: 1,
    }).setOrigin(1, 0).setDepth(2001)
  }

  private renderDebugOverlay() {
    this.debugGraphics.clear().setVisible(this.debugVisible)
    this.debugLabel.setColor(this.debugVisible ? '#ffc45c' : '#586687')
    if (!this.debugVisible) return

    const { worldBounds, playerSpawn, collision, interactions } = this.layout
    this.debugGraphics.fillStyle(0xff4d72, 0.1)
    this.debugGraphics.lineStyle(2, 0xff4d72, 0.85)
    collision.forEach((rectangle) => {
      const rect = this.toPhaserRectangle(rectangle)
      this.debugGraphics.fillRectShape(rect)
      this.debugGraphics.strokeRectShape(rect)
    })

    this.debugGraphics.fillStyle(0x5cdfff, 0.06)
    this.debugGraphics.lineStyle(1, 0x5cdfff, 0.78)
    interactions.forEach((interaction) => {
      const rect = this.toPhaserRectangle(interaction)
      this.debugGraphics.fillRectShape(rect)
      this.debugGraphics.strokeRectShape(rect)
    })

    this.debugGraphics.lineStyle(2, 0xffc45c, 0.9)
    this.debugGraphics.strokeRectShape(this.toPhaserRectangle(worldBounds))
    this.debugGraphics.fillStyle(0x8a63ff, 1)
    this.debugGraphics.fillCircle(playerSpawn.x, playerSpawn.y, 5)
  }

  private toPhaserRectangle(rectangle: LibraryRectangle) {
    return new Phaser.Geom.Rectangle(
      rectangle.x - rectangle.width / 2,
      rectangle.y - rectangle.height / 2,
      rectangle.width,
      rectangle.height,
    )
  }
}
