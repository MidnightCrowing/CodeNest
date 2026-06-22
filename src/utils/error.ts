/**
 * 错误处理工具函数
 */

/**
 * 格式化操作错误信息
 * @param error - 错误对象
 * @returns 格式化后的错误消息
 */
export function formatActionError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return message.replace(/^Error:\s*/i, '').trim() || 'Unknown error'
}
