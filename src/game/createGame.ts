import Phaser from 'phaser'
import { createGameConfig } from './config'
import type { AvailableRoomId } from './rooms'

export function createLabGame(parent: HTMLElement, initialRoom: AvailableRoomId = 'lab') {
  return new Phaser.Game(createGameConfig(parent, initialRoom))
}
