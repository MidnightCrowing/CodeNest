// region 文本样式
const textStyle = {
  'head-0': 'text-25px font-bold',
  'head-1': 'text-22px font-bold',
  'head-2': 'text-18px font-bold',
  'head-3': 'text-16px font-bold lh-20px',
  'text-default': 'text-13px lh-16px',
  'text-paragraph': 'text-13px lh-19px',
  'text-medium': 'text-12px lh-15px',
  'text-small': 'text-11px lh-14px',
}
// endregion

// region 按钮样式
const btnBaseStyle = {
  border: 'border-0',
  radius: 'rounded-4px',
  text: 'text-13px lh-25px',
  size: 'min-w-72px',
  boxModel: 'px-14px',
}
const btnBase = `
  ${btnBaseStyle.border} 
  ${btnBaseStyle.radius} 
  ${btnBaseStyle.text} 
  ${btnBaseStyle.size} 
  ${btnBaseStyle.boxModel}
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

const buttonStyle = {
  button: `${btnBase} ${btn1Expand}`,
  'button-solid': `${btnBase} ${btn2Expand}`,
}
// endregion

// region 输入框样式
const inputBaseStyle = {
  bg: 'bg-transparent',
  color: 'color-$text-color-2 placeholder-$text-color-3',
  boxModel: 'm-2px px-6px py-5px',
  size: 'min-w-64px',
  border: 'border-0',
  radius: 'rounded-3px',
  outline: 'outline-solid outline-2px outline-$border-line focus:outline-$active-3',
}
const inputBase = `
  ${inputBaseStyle.bg}
  ${inputBaseStyle.color}
  ${inputBaseStyle.boxModel}
  ${inputBaseStyle.size}
  ${inputBaseStyle.border}
  ${inputBaseStyle.radius}
  ${inputBaseStyle.outline}
`
const inputStyle = {
  input: `${inputBase}`,
}
// endregion

// region 分隔线样式
const hrStyle = {
  hr: 'border-0 h-1px bg-$border-line',
}
// endregion

// Unocss 配置
const shortcuts = {
  ...textStyle,
  ...buttonStyle,
  ...inputStyle,
  ...hrStyle,
}

export default {
  shortcuts,
}
