import Phaser from 'phaser'
import { createGameConfig } from './config'

export function createLabGame(parent: HTMLElement) {
  return new Phaser.Game(createGameConfig(parent))
}
