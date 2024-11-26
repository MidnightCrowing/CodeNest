import type { BarColorScheme as JeBarColorSchemeEnum } from './constant'

// JeColorIcon
export interface ColorIconProps {
  /**
   * 图标的类型。
   *
   * - `default`: 默认图标类型，展示基本的图标样式。
   * - `circle`: 圆形图标样式，适用于需要圆形展示的情况。
   * - `vertical-bar`: 垂直条形图标样式，适用于需要条形展示的情况。
   *
   * 默认值为 `default`。
   */
  type?: 'default' | 'circle' | 'vertical-bar'

  /**
   * 颜色方案，决定图标的颜色。
   *
   * 使用 `JeBarColorScheme` 来选择图标颜色的预定义方案。
   */
  colorScheme?: JeBarColorSchemeEnum

  /**
   * 自定义颜色。
   *
   * 如果设置了 `customColor`，则优先使用此颜色，而忽略 `colorScheme` 的值。
   *
   * 使用标准的 CSS 颜色值，例如 `#FF5733` 或 `rgb(255, 87, 51)`。
   */
  customColor?: string
}

// JeGradient
export interface GradientProps {
  /**
   * 颜色方案，决定渐变色的配色方案。
   *
   * 使用 `JeBarColorScheme` 来选择渐变色的预定义颜色。
   */
  colorScheme: JeBarColorSchemeEnum
}
