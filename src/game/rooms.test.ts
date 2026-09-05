import { describe, expect, it } from 'vitest'
import {
  getRoomPath,
  isAvailableRoom,
  resolveInitialRoom,
  roomById,
  rooms,
} from './rooms'

describe('room registry', () => {
  it('keeps the four confirmed room roles stable', () => {
    expect(rooms.map(({ id }) => id)).toEqual([
      'lab',
      'library',
      'after-hours',
      'observatory',
    ])
    expect(roomById.library.status).toBe('available')
    expect(isAvailableRoom('observatory')).toBe(false)
  })

  it('routes blog and library paths into the library scene', () => {
    expect(resolveInitialRoom('/library')).toBe('library')
    expect(resolveInitialRoom('/library/')).toBe('library')
    expect(resolveInitialRoom('/blog')).toBe('library')
    expect(resolveInitialRoom('/blog/')).toBe('library')
    expect(resolveInitialRoom('/blog/why-this-lab-uses-two-runtimes')).toBe('library')
    expect(resolveInitialRoom('/')).toBe('lab')
    expect(getRoomPath('lab')).toBe('/lab')
  })
})
