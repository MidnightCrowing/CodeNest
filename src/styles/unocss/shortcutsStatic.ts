// region 文本样式
const textColorDefault = 'text-theme-text-default'

// Link 样式
const textLinkStyles = {
  cursor: 'cursor-pointer',
  text: 'text-theme-text-link hover:text-theme-text-linkHover',
  textDecoration: 'no-underline',
}
const textLink = `
  ${textLinkStyles.cursor}
  ${textLinkStyles.text}
  ${textLinkStyles.textDecoration}
`

const textStyles = {
  'head-1-default': `text-14px lh-20px`,
  'head-2-default': `text-12px lh-18px`,
  'text-default': `text-13px lh-16px ${textColorDefault}`,
  'text-small': `text-11px lh-14px ${textColorDefault}`,
  'text-comment': `text-theme-text-infoInput`,
  'text-help': `text-theme-text-infoPanel`,
  'text-link': `${textLink}`,
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

const staticStyle = {
  ...textStyles,
  ...scrollbarStyle,
}

export default staticStyle
