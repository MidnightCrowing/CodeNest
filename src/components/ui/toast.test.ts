import { beforeEach, describe, expect, it } from 'vitest'

import {
  dismissOverflowToast,
  dismissToast,
  MAX_VISIBLE_TOASTS,
  overflowToastCount,
  showToast,
  toasts,
} from './toast'

describe('toast state', () => {
  beforeEach(() => {
    toasts.value = []
    overflowToastCount.value = 0
  })

  it('adds new toasts to the front of the visible list', () => {
    const firstId = showToast({ title: 'First' })
    const secondId = showToast({ title: 'Second', tone: 'success' })

    expect(toasts.value.map(toast => toast.id)).toEqual([secondId, firstId])
    expect(toasts.value[0]).toMatchObject({
      count: 1,
      title: 'Second',
      tone: 'success',
    })
  })

  it('merges duplicate toasts and increments their count', () => {
    const firstId = showToast({ title: 'Saved', description: 'Project updated', tone: 'success' })
    const secondId = showToast({ title: 'Other' })
    const duplicateId = showToast({ title: 'Saved', description: 'Project updated', tone: 'success' })

    expect(duplicateId).toBe(firstId)
    expect(toasts.value.map(toast => toast.id)).toEqual([firstId, secondId])
    expect(toasts.value[0].count).toBe(2)
  })

  it('compacts extra visible toasts into the overflow count', () => {
    for (let index = 1; index <= MAX_VISIBLE_TOASTS + 2; index += 1)
      showToast({ title: `Toast ${index}` })

    expect(toasts.value).toHaveLength(MAX_VISIBLE_TOASTS)
    expect(toasts.value.map(toast => toast.title)).toEqual(['Toast 5', 'Toast 4', 'Toast 3'])
    expect(overflowToastCount.value).toBe(2)
  })

  it('dismisses visible and overflow toasts', () => {
    const firstId = showToast({ title: 'First' })
    for (let index = 2; index <= MAX_VISIBLE_TOASTS + 1; index += 1)
      showToast({ title: `Toast ${index}` })

    dismissToast(firstId)
    dismissOverflowToast()

    expect(toasts.value.some(toast => toast.id === firstId)).toBe(false)
    expect(overflowToastCount.value).toBe(0)
  })
})
