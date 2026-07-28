import Phaser from 'phaser'
import type { StationId } from '../../content/stations'
import { labBridge } from '../bridge'
import type { Player } from '../entities/Player'

export interface InteractiveStation {
  id: StationId
  zone: Phaser.GameObjects.Zone
}

export class InteractionSystem {
  private nearbyStation: StationId | null = null
  private readonly interactKeys: Phaser.Input.Keyboard.Key[]

  constructor(
    scene: Phaser.Scene,
    private readonly player: Player,
    private readonly stations: readonly InteractiveStation[],
  ) {
    this.interactKeys = [
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    ]
  }

  update(enabled: boolean) {
    const nextStation = enabled ? this.findNearbyStation() : null

    if (nextStation !== this.nearbyStation) {
      this.nearbyStation = nextStation
      labBridge.emit('station:nearby', { stationId: nextStation })
    }

    if (
      nextStation
      && this.interactKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))
    ) {
      labBridge.emit('station:activate', { stationId: nextStation })
    }
  }

  private findNearbyStation() {
    const playerBounds = this.player.getBounds()

    return this.stations.find(({ zone }) =>
      Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, zone.getBounds()),
    )?.id ?? null
  }
}
