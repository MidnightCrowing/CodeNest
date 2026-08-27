import { describe, expect, it } from 'vitest'

const sfcSources = import.meta.glob('../**/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const styleBlockRe = /<style\b([^>]*)>([\s\S]*?)<\/style>/g

function findScopedKeyframeBlocks() {
  const offenders: string[] = []

  for (const [path, source] of Object.entries(sfcSources)) {
    for (const [, attrs, content] of source.matchAll(styleBlockRe)) {
      if (/\bscoped\b/.test(attrs) && /@keyframes\b/.test(content))
        offenders.push(path)
    }
  }

  return offenders.sort()
}

describe('sfc style blocks', () => {
  // Vue 会重命名 scoped 块里的 @keyframes，而 UnoCSS 的 @apply 在其之后才展开，
  // 导致 animation 指向不存在的 keyframes，动画不触发、Presence 组件无法卸载。
  it('never declares @keyframes inside a scoped style block', () => {
    expect(Object.keys(sfcSources).length).toBeGreaterThan(0)
    expect(findScopedKeyframeBlocks()).toEqual([])
  })
})
