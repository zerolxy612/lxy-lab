import type { AvailableRoomId } from './rooms'

export function shouldUseArchiveCorridor(
  from: AvailableRoomId,
  to: AvailableRoomId,
  reducedMotion: boolean,
  compactViewport: boolean,
) {
  const connectsArchive = (from === 'lab' && to === 'library')
    || (from === 'library' && to === 'lab')
  return connectsArchive && !reducedMotion && !compactViewport
}
