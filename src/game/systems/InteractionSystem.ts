import Phaser from 'phaser'
import type { StationId } from '../../content/stations'
import type { NpcId } from '../../content/npcs'
import { labBridge } from '../bridge'
import type { NpcDialogueAnchor } from '../bridge'
import type { Player } from '../entities/Player'

export interface InteractiveStation {
  id: StationId
  zone: Phaser.GameObjects.Zone
}

export interface InteractiveNpc {
  id: NpcId
  zone: Phaser.GameObjects.Zone
  getDialogueAnchor: () => NpcDialogueAnchor
}

type NearbyTarget =
  | { kind: 'station'; id: StationId }
  | { kind: 'npc'; id: NpcId }

export class InteractionSystem {
  private nearbyTarget: NearbyTarget | null = null
  private readonly interactKeys: Phaser.Input.Keyboard.Key[]

  constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
    private readonly stations: readonly InteractiveStation[],
    private readonly npcs: readonly InteractiveNpc[],
  ) {
    this.interactKeys = [
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    ]
  }

  update(enabled: boolean) {
    const nextTarget = enabled ? this.findNearbyTarget() : null

    if (
      nextTarget?.kind !== this.nearbyTarget?.kind
      || nextTarget?.id !== this.nearbyTarget?.id
    ) {
      this.nearbyTarget = nextTarget
      labBridge.emit('station:nearby', {
        stationId: nextTarget?.kind === 'station' ? nextTarget.id : null,
      })
      labBridge.emit('npc:nearby', {
        npcId: nextTarget?.kind === 'npc' ? nextTarget.id : null,
        anchor: nextTarget?.kind === 'npc'
          ? this.npcs.find(({ id }) => id === nextTarget.id)?.getDialogueAnchor() ?? null
          : null,
      })
    }

    if (
      nextTarget
      && this.interactKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))
    ) {
      if (nextTarget.kind === 'station') {
        labBridge.emit('station:activate', { stationId: nextTarget.id })
      } else {
        const npc = this.npcs.find(({ id }) => id === nextTarget.id)
        if (npc) {
          labBridge.emit('npc:activate', {
            npcId: nextTarget.id,
            anchor: npc.getDialogueAnchor(),
          })
        }
      }
    }
  }

  private findNearbyTarget(): NearbyTarget | null {
    const playerBounds = this.player.getBounds()
    const center = Phaser.Geom.Rectangle.GetCenter(playerBounds)
    const targets: Array<{ target: NearbyTarget; distance: number }> = [
      ...this.npcs.map(({ id, zone }) => ({
        target: { kind: 'npc' as const, id },
        zone,
      })),
      ...this.stations.map(({ id, zone }) => ({
        target: { kind: 'station' as const, id },
        zone,
      })),
    ].filter(({ zone }) =>
      Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, zone.getBounds()),
    ).map(({ target, zone }) => ({
      target,
      distance: Phaser.Math.Distance.Between(center.x, center.y, zone.x, zone.y),
    }))

    targets.sort((a, b) => a.distance - b.distance)
    return targets[0]?.target ?? null
  }
}
