import type { StylesType } from './types'

// region 文本样式
const textSizeBase = {
  head1: {
    thin: 'text-14px lh-20px',
    bold: 'text-14px lh-20px font-bold',
  },
  head2: {
    thin: 'text-12px lh-18px',
    bold: 'text-12px lh-18px font-bold',
  },
  default: 'text-13px lh-16px',
  small: 'text-11px lh-14px',
}

// Comment 样式
const textCommentStyles = {
  text: 'text-$text-color-3',
  fill: 'fill-$text-color-3',
}

// Help 样式
const textHelpStyles = {
  text: 'text-$text-color-4',
  fill: 'fill-$text-color-4',
}

// Link 样式
const textLinkStyles = {
  cursor: 'cursor-pointer',
  fill: 'fill-$text-link hover:fill-$text-link-hover',
  text: 'text-$text-link hover:text-$text-link-hover',
  textDecoration: 'no-underline',
}

const textColorBase = {
  default: 'text-$text-color-2',
  comment: `
    ${textCommentStyles.text}
    ${textCommentStyles.fill}
    `,
  help: `
    ${textHelpStyles.text}
    ${textHelpStyles.fill}
    `,
  link: `
    ${textLinkStyles.cursor}
    ${textLinkStyles.fill}
    ${textLinkStyles.text}
    ${textLinkStyles.textDecoration}
    `,
}

const textStyles = {
  'head-1': `${textSizeBase.head1.bold}`,
  'head-2': `${textSizeBase.head2.bold}`,
  'head-1-thin': `${textSizeBase.head1.thin}`,
  'head-2-thin': `${textSizeBase.head2.thin}`,
  'text-default': `${textSizeBase.default} ${textColorBase.default}`,
  'text-small': `${textSizeBase.small} ${textColorBase.default}`,
  'text-comment': `${textColorBase.comment}`,
  'text-help': `${textColorBase.help}`,
  'text-link': `${textColorBase.link}`,
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
  'button-default': `${btnBase} ${btn1Expand}`,
  'button-solid': `${btnBase} ${btn2Expand}`,
}
// endregion

// region 复选框样式
const checkBoxBaseStyle = {
  align: 'align-middle',
  appearance: 'appearance-none',
  bg: 'bg-transparent checked:!bg-$active-3',
  border:
    'border-solid border-2px border-$border-1 focus:border-$border-2 checked:border-transparent',
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
  'check-box-default': `${checkBoxBase}`,
}
// endregion

// region 分隔线样式
const hrStyles = {
  'hr-default': 'border-0 h-1px bg-$border-line',
}
// endregion

// Unocss 配置
const shortcuts: StylesType = {
  ...textStyles,
  ...buttonStyles,
  ...checkBoxStyles,
  ...hrStyles,
}

export default {
  shortcuts,
}
