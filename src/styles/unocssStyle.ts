import type { StylesType } from './types'

// region 文本样式
const textHelpStyle = {
  fill: 'fill-$text-color-4',
  text: 'text-$text-color-4',
}
const textHelp = `
  ${textHelpStyle.fill}
  ${textHelpStyle.text} 
`

const textLinkBaseStyle = {
  cursor: 'cursor-pointer',
  fill: 'fill-$text-link hover:fill-$text-link-hover',
  text: 'text-$text-link hover:text-$text-link-hover',
  textDecoration: 'no-underline',
}
const textLinkBase = `
  ${textLinkBaseStyle.cursor} 
  ${textLinkBaseStyle.fill}
  ${textLinkBaseStyle.text} 
  ${textLinkBaseStyle.textDecoration} 
`

const textStyles = {
  'head-1': 'text-14px lh-20px font-bold',
  'head-2': 'text-12px lh-18px font-bold',
  'head-1-thin': 'text-14px lh-20px',
  'head-2-thin': 'text-12px lh-18px',
  'text-default': 'text-13px lh-16px',
  'text-small': 'text-11px lh-14px',
  'text-help': `${textHelp}`,
  'text-link': `${textLinkBase}`,
}
// endregion

// region 按钮样式
const btnBaseStyle = {
  border: 'border-0',
  boxModel: 'px-14px',
  radius: 'rounded-4px',
  size: 'min-w-72px',
  text: 'text-13px lh-25px',
}
const btnBase = `
  ${btnBaseStyle.border} 
  ${btnBaseStyle.boxModel}
  ${btnBaseStyle.radius} 
  ${btnBaseStyle.size} 
  ${btnBaseStyle.text} 
`

const btn1ExpandStyle = {
  bg: 'bg-$button-bg-1',
  color: 'color-$text-color-2',
  outline: 'outline outline-2px outline-$border-1 active:outline-$border-2',
}
const btn1Expand = `
  ${btn1ExpandStyle.bg}
  ${btn1ExpandStyle.color} 
  ${btn1ExpandStyle.outline}
`

const btn2ExpandStyle = {
  bg: 'bg-$button-bg-2 active:bg-$active-3',
  color: 'color-$text-color-1',
}
const btn2Expand = `
  ${btn2ExpandStyle.bg}
  ${btn2ExpandStyle.color}
`

const buttonStyles = {
  'button-base': `${btnBase}`,
  'button': `${btnBase} ${btn1Expand}`,
  'button-solid': `${btnBase} ${btn2Expand}`,
}
// endregion

// region 输入框样式
const inputBaseStyle = {
  bg: 'bg-transparent',
  border: 'border-0',
  boxModel: 'm-2px px-6px py-5px',
  color: 'color-$text-color-2 placeholder-$text-color-3',
  outline: 'outline-solid outline-2px outline-$border-line focus:outline-$active-3',
  radius: 'rounded-3px',
  size: 'min-w-64px',
}
const inputBase = `
  ${inputBaseStyle.bg}
  ${inputBaseStyle.border}
  ${inputBaseStyle.boxModel}
  ${inputBaseStyle.color}
  ${inputBaseStyle.outline}
  ${inputBaseStyle.radius}
  ${inputBaseStyle.size}
`
const inputStyles = {
  'input': `${inputBase}`,
}
// endregion

// region 复选框样式
const checkBoxBaseStyle = {
  align: 'align-middle',
  appearance: 'appearance-none',
  bg: 'bg-transparent checked:!bg-$active-3',
  border: 'border-solid border-2px border-$border-1 focus:border-$border-2 checked:border-transparent',
  boxModel: 'm-0',
  icon: 'checked:i-mode-checkbox-checked',
  outline: 'outline-solid outline-2px outline-transparent checked:focus:outline-$active-3',
  outlineOffset: 'outline-offset-1px',
  radius: 'rounded-4px',
  size: '!size-20px',
}
const checkBoxBase = `
  ${checkBoxBaseStyle.align}
  ${checkBoxBaseStyle.appearance}
  ${checkBoxBaseStyle.bg}
  ${checkBoxBaseStyle.border}
  ${checkBoxBaseStyle.boxModel}
  ${checkBoxBaseStyle.icon}
  ${checkBoxBaseStyle.outline}
  ${checkBoxBaseStyle.outlineOffset}
  ${checkBoxBaseStyle.radius}
  ${checkBoxBaseStyle.size}
`
const checkBoxStyles = {
  'check-box': `${checkBoxBase}`,
}
// endregion

// region 分隔线样式
const hrStyles = {
  'hr': 'border-0 h-1px bg-$border-line',
}
// endregion

// Unocss 配置
const shortcuts: StylesType = {
  ...textStyles,
  ...buttonStyles,
  ...inputStyles,
  ...checkBoxStyles,
  ...hrStyles,
}

export default {
  shortcuts,
}
