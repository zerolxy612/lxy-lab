import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { LabScene } from './scenes/LabScene'

export const LAB_WIDTH = 960
export const LAB_HEIGHT = 540

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
    scene: [BootScene, LabScene],
  }
}
