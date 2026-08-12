import Phaser from 'phaser'
import { labBridge } from './bridge'
import { roomById, type AvailableRoomId } from './rooms'
import type { ArchiveCorridorData } from './scenes/ArchiveCorridorScene'
import { shouldUseArchiveCorridor } from './archiveCorridorRoute'

export interface RoomTransitionData {
  entryFrom?: AvailableRoomId
}

export function transitionToRoom(
  scene: Phaser.Scene,
  from: AvailableRoomId,
  to: AvailableRoomId,
  reducedMotion: boolean,
) {
  if (from === to) return false

  labBridge.emit('room:leaving', { from, to })
  labBridge.emit('station:nearby', { stationId: null })
  labBridge.emit('npc:nearby', { npcId: null, anchor: null })
  labBridge.emit('room:nearby', { roomId: from, targetId: null, label: null })

  const startNextRoom = () => {
    const compactViewport = window.matchMedia('(max-width: 900px)').matches
    if (shouldUseArchiveCorridor(from, to, reducedMotion, compactViewport)) {
      scene.scene.start('archive-corridor', { from, to } satisfies ArchiveCorridorData)
      return
    }
    scene.scene.start(roomById[to].sceneKey, { entryFrom: from } satisfies RoomTransitionData)
  }

  if (reducedMotion) {
    startNextRoom()
    return true
  }

  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, startNextRoom)
  scene.cameras.main.fadeOut(220, 7, 9, 22)
  return true
}
