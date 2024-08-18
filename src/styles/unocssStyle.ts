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
  text: 'text-theme-text-infoInput',
  fill: 'fill-theme-text-infoInput',
}

// Help 样式
const textHelpStyles = {
  text: 'text-theme-text-infoPanel',
  fill: 'fill-theme-text-infoPanel',
}

// Link 样式
const textLinkStyles = {
  cursor: 'cursor-pointer',
  fill: 'fill-theme-text-link hover:fill-theme-text-linkHover',
  text: 'text-theme-text-link hover:text-theme-text-linkHover',
  textDecoration: 'no-underline',
}

const textColorBase = {
  default: 'text-theme-text-default',
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

// region 滚动条样式
const scrollbarBaseStyles = {
  track: 'scrollbar-track:bg-transparent',
  corner: 'scrollbar-corner:bg-transparent',
  thumb: 'scrollbar-thumb:bg-theme-scrollbar-thumb',
  thumbHover: 'hover:scrollbar-thumb:bg-theme-scrollbar-thumbHover',
}
const scrollbarBase = `
  ${scrollbarBaseStyles.track}
  ${scrollbarBaseStyles.corner}
  ${scrollbarBaseStyles.thumb}
  ${scrollbarBaseStyles.thumbHover}
`

const scrollbarDefaultExpandStyles = {
  width: 'scrollbar:w-8px',
  // rounded: 'scrollbar-thumb:rounded-4px',
}
const scrollbarDefaultExpand = `
  ${scrollbarDefaultExpandStyles.width}
`

const scrollbarThinExpandStyles = {
  width: 'scrollbar:w-5px',
}
const scrollbarThinExpand = `
  ${scrollbarThinExpandStyles.width}
`

const scrollbarStyle = {
  'scrollbar-default': `${scrollbarBase} ${scrollbarDefaultExpand}`,
  'scrollbar-thin': `${scrollbarBase} ${scrollbarThinExpand}`,
}
// endregion

// Unocss 配置
const shortcuts: StylesType = {
  ...textStyles,
  ...scrollbarStyle,
}

export default {
  shortcuts,
}
