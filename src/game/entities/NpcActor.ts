import Phaser from 'phaser'
import type { NpcId } from '../../content/npcs'
import { npcById } from '../../content/npcs'
import { NPC_ART } from '../art/npcArt'
import type { PlayerFacing } from '../art/playerArt'
import type { NpcLayout } from '../layout/labLayout'
import type { Player } from './Player'

const ROOK_SPEED = 34

export class NpcActor {
  readonly id: NpcId
  readonly zone: Phaser.GameObjects.Zone
  private readonly sprite: Phaser.GameObjects.Sprite
  private readonly shadow: Phaser.GameObjects.Ellipse
  private readonly label: Phaser.GameObjects.Text
  private routeIndex = 1
  private facing: PlayerFacing = 'down'
  private frameClock = 0

  constructor(
    scene: Phaser.Scene,
    private readonly layout: NpcLayout,
  ) {
    this.id = layout.id
    const art = NPC_ART[this.id]
    this.shadow = scene.add.ellipse(layout.x, layout.y - 2, art.frameWidth * 0.62, 9, 0x02040c, 0.56)
      .setDepth(layout.y - 1)
    this.sprite = scene.add.sprite(layout.x, layout.y, art.key, art.frames.down.idle)
      .setOrigin(0.5, 1)
      .setDepth(layout.y)

    this.zone = scene.add.zone(
      layout.x,
      layout.y - art.frameHeight / 2,
      art.frameWidth + layout.interactionPadding,
      art.frameHeight + layout.interactionPadding,
    ).setInteractive({ useHandCursor: true })

    this.label = scene.add.text(layout.x, layout.y + 5, npcById[this.id].name, {
      color: npcById[this.id].accent,
      fontFamily: 'sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      letterSpacing: 1.5,
    }).setOrigin(0.5, 0).setAlpha(0.68).setDepth(1001)
  }

  update(delta: number, player: Player, paused: boolean, reducedMotion: boolean) {
    this.frameClock += delta
    if (this.layout.movement === 'patrol' && !paused && !reducedMotion) {
      this.advancePatrol(delta)
    } else if (paused) {
      this.facePlayer(player)
    }

    const art = NPC_ART[this.id]
    const moving = this.layout.movement === 'patrol' && !paused && !reducedMotion
    const alternate = moving
      ? Math.floor(this.frameClock / 220) % 2 === 1
      : !reducedMotion && Math.floor(this.frameClock / 1500) % 2 === 1
    this.sprite.setFrame(alternate ? art.frames[this.facing].gesture : art.frames[this.facing].idle)
    this.syncObjects()
  }

  private advancePatrol(delta: number) {
    const route = this.layout.route
    if (route.length < 2) return
    const target = route[this.routeIndex]
    const dx = target.x - this.sprite.x
    const dy = target.y - this.sprite.y
    const distance = Math.hypot(dx, dy)
    if (distance <= 1) {
      this.routeIndex = (this.routeIndex + 1) % route.length
      return
    }

    const step = Math.min(distance, ROOK_SPEED * delta / 1000)
    this.sprite.x += dx / distance * step
    this.sprite.y += dy / distance * step
    this.facing = Math.abs(dx) > Math.abs(dy)
      ? dx < 0 ? 'left' : 'right'
      : dy < 0 ? 'up' : 'down'
  }

  private facePlayer(player: Player) {
    const dx = player.x - this.sprite.x
    const dy = player.y - this.sprite.y
    this.facing = Math.abs(dx) > Math.abs(dy)
      ? dx < 0 ? 'left' : 'right'
      : dy < 0 ? 'up' : 'down'
  }

  private syncObjects() {
    const art = NPC_ART[this.id]
    this.sprite.setDepth(this.sprite.y)
    this.shadow.setPosition(this.sprite.x, this.sprite.y - 2).setDepth(this.sprite.y - 1)
    this.zone.setPosition(this.sprite.x, this.sprite.y - art.frameHeight / 2)
    this.label.setPosition(this.sprite.x, this.sprite.y + 5)
  }
}
