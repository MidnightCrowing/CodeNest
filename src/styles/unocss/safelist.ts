import type { Theme } from '@unocss/preset-mini'
import type { Arrayable, SafeListContext } from 'unocss'

import { appOptions } from '~/constants/appOptions'

// 从 appOptions 中提取所有 iconClass 字段的值，并将它们映射为一个数组，
// 过滤掉 undefined 的值，确保数组中只包含字符串
const appIconClasses = appOptions
  .map(option => option.iconClass)
  .filter(Boolean) as string[] // 断言类型为 string[]，确保类型匹配

const safelist: (string | ((context: SafeListContext<Theme>) => Arrayable<string>))[] = [
  ...appIconClasses,
]

export default safelist
