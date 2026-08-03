/**
 * 将任意错误归一化为可展示的短消息。
 */
export function formatActionError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return message.trim().replace(/^Error:\s*/i, '').trim() || 'Unknown error'
}
