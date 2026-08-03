import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { ElevatorScene } from './scenes/ElevatorScene'
import { LabScene } from './scenes/LabScene'
import { LAB_HEIGHT, LAB_WIDTH } from './dimensions'

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
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
    scene: [BootScene, ElevatorScene, LabScene],
  }
}
