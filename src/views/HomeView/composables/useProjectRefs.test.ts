import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useProjectRefs } from './useProjectRefs'

class FakeHTMLElement {
  style: Record<string, string> = {}
}

describe('useProjectRefs', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('HTMLElement', FakeHTMLElement)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('stores and removes project item and action refs', () => {
    const refs = useProjectRefs()
    const item = new FakeHTMLElement()
    const actions = new FakeHTMLElement()

    refs.setProjectItemRef(1, item)
    refs.setProjectActionsRef(1, actions)

    expect(refs.projectItemRefs.get(1)).toBe(item)
    expect(refs.projectActionRefs.get(1)).toBe(actions)

    refs.deleteProjectRefs(1)

    expect(refs.projectItemRefs.has(1)).toBe(false)
    expect(refs.projectActionRefs.has(1)).toBe(false)
  })

  it('clears all refs', () => {
    const refs = useProjectRefs()

    refs.setProjectItemRef(1, new FakeHTMLElement())
    refs.setProjectActionsRef(2, new FakeHTMLElement())
    refs.clearProjectRefs()

    expect(refs.projectItemRefs.size).toBe(0)
    expect(refs.projectActionRefs.size).toBe(0)
  })

  it('applies the remove animation styles', async () => {
    const refs = useProjectRefs()
    const item = new FakeHTMLElement()

    refs.setProjectItemRef(1, item)
    const animation = refs.playProjectRemoveAnimation(1)

    expect(item.style.pointerEvents).toBe('none')
    expect(item.style.opacity).toBe('0')
    expect(item.style.transform).toBe('scale(0.985)')

    vi.advanceTimersByTime(180)
    await animation
  })
})
