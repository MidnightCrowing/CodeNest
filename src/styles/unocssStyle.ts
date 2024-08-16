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

// Unocss 配置
const shortcuts: StylesType = {
  ...textStyles,
}

export default {
  shortcuts,
}
