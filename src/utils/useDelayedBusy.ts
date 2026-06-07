import type { Ref } from 'vue'
import { onScopeDispose, ref, watch } from 'vue'

interface DelayedBusyOptions {
  delay?: number
  minDuration?: number
}

export function useDelayedBusy(source: Ref<boolean>, options: DelayedBusyOptions = {}) {
  const delay = options.delay ?? 200
  const minDuration = options.minDuration ?? 300
  const visible = ref(false)
  let showTimer: ReturnType<typeof window.setTimeout> | null = null
  let hideTimer: ReturnType<typeof window.setTimeout> | null = null
  let shownAt = 0

  function clearShowTimer() {
    if (showTimer !== null) {
      window.clearTimeout(showTimer)
      showTimer = null
    }
  }

  function clearHideTimer() {
    if (hideTimer !== null) {
      window.clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  const stop = watch(
    source,
    (busy) => {
      if (busy) {
        clearHideTimer()
        if (visible.value)
          return

        clearShowTimer()
        showTimer = window.setTimeout(() => {
          showTimer = null
          if (!source.value)
            return

          visible.value = true
          shownAt = performance.now()
        }, delay)
        return
      }

      clearShowTimer()
      if (!visible.value)
        return

      const remaining = minDuration - (performance.now() - shownAt)
      if (remaining <= 0) {
        visible.value = false
        return
      }

      clearHideTimer()
      hideTimer = window.setTimeout(() => {
        hideTimer = null
        if (!source.value)
          visible.value = false
      }, remaining)
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    stop()
    clearShowTimer()
    clearHideTimer()
  })

  return visible
}

export function useDelayedBusyKeys<Key>(options: DelayedBusyOptions = {}) {
  const delay = options.delay ?? 200
  const minDuration = options.minDuration ?? 300
  const visibleKeys = ref(new Set<Key>()) as Ref<Set<Key>>
  const activeKeys = new Set<Key>()
  const showTimers = new Map<Key, ReturnType<typeof window.setTimeout>>()
  const hideTimers = new Map<Key, ReturnType<typeof window.setTimeout>>()
  const shownAt = new Map<Key, number>()

  function clearKeyTimer(map: Map<Key, ReturnType<typeof window.setTimeout>>, key: Key) {
    const timer = map.get(key)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      map.delete(key)
    }
  }

  function setVisibleKey(key: Key, visible: boolean) {
    if (visibleKeys.value.has(key) === visible)
      return

    const next = new Set(visibleKeys.value)
    if (visible)
      next.add(key)
    else
      next.delete(key)
    visibleKeys.value = next
  }

  function setKeyBusy(key: Key, busy: boolean) {
    if (busy) {
      activeKeys.add(key)
      clearKeyTimer(hideTimers, key)
      if (visibleKeys.value.has(key))
        return

      clearKeyTimer(showTimers, key)
      showTimers.set(
        key,
        window.setTimeout(() => {
          showTimers.delete(key)
          if (!activeKeys.has(key))
            return

          setVisibleKey(key, true)
          shownAt.set(key, performance.now())
        }, delay),
      )
      return
    }

    activeKeys.delete(key)
    clearKeyTimer(showTimers, key)
    if (!visibleKeys.value.has(key))
      return

    const remaining = minDuration - (performance.now() - (shownAt.get(key) ?? 0))
    if (remaining <= 0) {
      setVisibleKey(key, false)
      shownAt.delete(key)
      return
    }

    clearKeyTimer(hideTimers, key)
    hideTimers.set(
      key,
      window.setTimeout(() => {
        hideTimers.delete(key)
        if (activeKeys.has(key))
          return

        setVisibleKey(key, false)
        shownAt.delete(key)
      }, remaining),
    )
  }

  onScopeDispose(() => {
    for (const timer of showTimers.values())
      window.clearTimeout(timer)
    for (const timer of hideTimers.values())
      window.clearTimeout(timer)
  })

  return {
    visibleKeys,
    setKeyBusy,
  }
}
