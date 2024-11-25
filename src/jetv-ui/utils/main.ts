/**
 * 将字符串的首字母转换为大写
 * @param str - 需要转换的字符串
 * @returns {string} 转换后的字符串
 */
export function capitalize(str: string): string {
  if (str.length === 0)
    return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 将字符串转换为大写
 * @param str - 需要转换的字符串
 * @returns {string} 转换后的大写字符串
 */
export function toUpperCase(str: string): string {
  return str.toUpperCase()
}
