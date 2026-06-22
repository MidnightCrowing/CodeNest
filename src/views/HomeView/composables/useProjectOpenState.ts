import { computed, onScopeDispose, ref } from 'vue'

import type { LocalProject } from '~/constants/localProject'

/**
 * 项目打开状态管理
 *
 * 管理项目和终端的打开状态，带最短可见时长防闪烁逻辑。
 * 确保 loading 图标至少显示指定时长，避免快速闪烁影响用户体验。
 */

const MIN_PROJECT_OPENING_VISIBLE_MS = 2200
const MIN_TERMINAL_OPENING_VISIBLE_MS = 800

export function useProjectOpenState() {
  const openingProjectIds = ref(new Set<number>())
  const openingTerminalProjectIds = ref(new Set<number>())
  const projectOpeningStartedAt = new Map<number, number>()
  const terminalOpeningStartedAt = new Map<number, number>()
  const projectOpeningTimers = new Map<number, ReturnType<typeof window.setTimeout>>()
  const terminalOpeningTimers = new Map<number, ReturnType<typeof window.setTimeout>>()

  // 项目打开状态管理
  function setProjectOpeningVisible(projectId: number, visible: boolean) {
    if (openingProjectIds.value.has(projectId) === visible)
      return

    const next = new Set(openingProjectIds.value)
    if (visible)
      next.add(projectId)
    else
      next.delete(projectId)
    openingProjectIds.value = next
  }

  function clearProjectOpeningTimer(projectId: number) {
    const timer = projectOpeningTimers.get(projectId)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      projectOpeningTimers.delete(projectId)
    }
  }

  function markProjectOpening(projectId: number) {
    clearProjectOpeningTimer(projectId)
    projectOpeningStartedAt.set(projectId, performance.now())
    setProjectOpeningVisible(projectId, true)
  }

  function finishProjectOpening(projectId: number) {
    clearProjectOpeningTimer(projectId)

    const startedAt = projectOpeningStartedAt.get(projectId) ?? performance.now()
    const remaining = MIN_PROJECT_OPENING_VISIBLE_MS - (performance.now() - startedAt)
    if (remaining <= 0) {
      clearProjectOpening(projectId)
      return
    }

    projectOpeningTimers.set(
      projectId,
      window.setTimeout(clearProjectOpening, remaining, projectId),
    )
  }

  function clearProjectOpening(projectId: number) {
    clearProjectOpeningTimer(projectId)
    projectOpeningStartedAt.delete(projectId)
    setProjectOpeningVisible(projectId, false)
  }

  function isProjectOpening(project: LocalProject): boolean {
    return openingProjectIds.value.has(project.appendTime)
  }

  // 终端打开状态管理
  function setTerminalOpeningVisible(projectId: number, visible: boolean) {
    if (openingTerminalProjectIds.value.has(projectId) === visible)
      return

    const next = new Set(openingTerminalProjectIds.value)
    if (visible)
      next.add(projectId)
    else
      next.delete(projectId)
    openingTerminalProjectIds.value = next
  }

  function clearTerminalOpeningTimer(projectId: number) {
    const timer = terminalOpeningTimers.get(projectId)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      terminalOpeningTimers.delete(projectId)
    }
  }

  function markTerminalOpening(projectId: number) {
    clearTerminalOpeningTimer(projectId)
    terminalOpeningStartedAt.set(projectId, performance.now())
    setTerminalOpeningVisible(projectId, true)
  }

  function finishTerminalOpening(projectId: number) {
    clearTerminalOpeningTimer(projectId)

    const startedAt = terminalOpeningStartedAt.get(projectId) ?? performance.now()
    const remaining = MIN_TERMINAL_OPENING_VISIBLE_MS - (performance.now() - startedAt)
    if (remaining <= 0) {
      clearTerminalOpening(projectId)
      return
    }

    terminalOpeningTimers.set(
      projectId,
      window.setTimeout(clearTerminalOpening, remaining, projectId),
    )
  }

  function clearTerminalOpening(projectId: number) {
    clearTerminalOpeningTimer(projectId)
    terminalOpeningStartedAt.delete(projectId)
    setTerminalOpeningVisible(projectId, false)
  }

  function isTerminalOpening(project: LocalProject): boolean {
    return openingTerminalProjectIds.value.has(project.appendTime)
  }

  // 清理特定项目的所有状态
  function clearProjectFromMaps(projectId: number) {
    clearProjectOpeningTimer(projectId)
    projectOpeningStartedAt.delete(projectId)
    clearTerminalOpeningTimer(projectId)
    terminalOpeningStartedAt.delete(projectId)
  }

  // 组件卸载时清理所有定时器
  onScopeDispose(() => {
    projectOpeningTimers.forEach(timer => window.clearTimeout(timer))
    projectOpeningTimers.clear()
    projectOpeningStartedAt.clear()
    terminalOpeningTimers.forEach(timer => window.clearTimeout(timer))
    terminalOpeningTimers.clear()
    terminalOpeningStartedAt.clear()
  })

  return {
    // 只读状态
    openingProjectIds: computed(() => openingProjectIds.value),
    openingTerminalProjectIds: computed(() => openingTerminalProjectIds.value),

    // 项目打开
    markProjectOpening,
    finishProjectOpening,
    clearProjectOpening,
    isProjectOpening,

    // 终端打开
    markTerminalOpening,
    finishTerminalOpening,
    clearTerminalOpening,
    isTerminalOpening,

    // 清理
    clearProjectFromMaps,
  }
}
