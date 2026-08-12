import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { ElevatorScene } from './scenes/ElevatorScene'
import { LabScene } from './scenes/LabScene'
import { LibraryScene } from './scenes/LibraryScene'
import { ArchiveCorridorScene } from './scenes/ArchiveCorridorScene'
import { LAB_HEIGHT, LAB_WIDTH } from './dimensions'
import type { AvailableRoomId } from './rooms'

export function createGameConfig(
  parent: HTMLElement,
  initialRoom: AvailableRoomId = 'lab',
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: LAB_WIDTH,
    height: LAB_HEIGHT,
    backgroundColor: '#090b1d',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: LAB_WIDTH,
      height: LAB_HEIGHT,
    },
    callbacks: {
      preBoot: (game) => game.registry.set('initialRoom', initialRoom),
    },
    scene: [BootScene, ElevatorScene, LabScene, ArchiveCorridorScene, LibraryScene],
  }
}
