<script lang="ts" setup>
import { computed, ref } from 'vue'

import { JeGroupHeader } from '../Header'
import type { Menu, Option } from './type'

const props = defineProps<Menu>()

/**
 * 检查菜单项中是否存在图标。
 * 如果菜单项或其子项有图标，返回 `true`，否则返回 `false`。
 * @returns {boolean} 是否包含图标
 */
const hasIcon = computed(() => {
  return props.options.some((option) => {
    // 如果是 OptionGroup，检查其 `options` 内的每个 Option
    if ('options' in option) {
      return option.options.some(opt => !!opt.icon)
    }
    // 如果是单个 Option，直接检查 `icon`
    return !!option.icon
  })
})

/**
 * 存储当前鼠标悬停的选项索引。
 */
const hoveredOptionIndex = ref<string | number | null>(null)

/**
 * 设置当前鼠标悬停的选项索引。
 * @param index - 悬停选项的索引
 */
function setHoveredOption(index: string | number) {
  hoveredOptionIndex.value = index
}

/**
 * 将字符串转换为大写字母。
 * @param str - 需要转换的大写字符串
 * @returns {string} 转换后的大写字符串
 */
function toUpperCase(str: string): string {
  return str.toUpperCase()
}

/**
 * 将字符串的首字母转换为大写，其余部分保持原样。
 * @param str - 需要转换的字符串
 * @returns {string} 首字母大写后的字符串
 */
function capitalize(str: string): string {
  if (str.length === 0)
    return str // 如果字符串为空，直接返回原字符串
  return str.charAt(0).toUpperCase() + str.slice(1) // 首字母大写，其余部分不变
}

/**
 * 格式化快捷键，确保每个键的首字母大写，并用加号连接。
 * @param keys - 快捷键数组
 * @returns {string} 格式化后的快捷键字符串
 */
function formatShortcut(keys: string[]): string {
  return keys
    .map(key => capitalize(key)) // 使用 capitalize 函数将每个快捷键的首字母大写
    .join('+') // 用加号连接快捷键
}

/**
 * 处理选项点击事件，触发对应的 `onClick` 回调函数（如果存在）。
 * @param option - 被点击的选项
 */
function handleOptionClick(option: Option) {
  if (option.onClick) {
    option.onClick() // 调用选项的 `onClick` 回调函数
  }
}
</script>

<template>
  <ul v-if="options" class="je-menu">
    <!-- 菜单标题 -->
    <li v-if="title" class="menu-title">
      {{ title }}
    </li>

    <template v-for="(option, index) in options" :key="option.value">
      <!-- 单项菜单 -->
      <template v-if="!('groupLabel' in option)">
        <!-- 分割线 -->
        <li v-if="option.isLine" class="option-line">
          <hr>
        </li>

        <!-- 菜单项 -->
        <li
          v-else
          class="option-item"
          :class="{ hovered: option.childMenu && hoveredOptionIndex === index }"
          @click="handleOptionClick(option)"
          @mouseenter="setHoveredOption(index)"
        >
          <div class="option-item-left">
            <!-- Option Icon -->
            <span v-show="hasIcon" class="option-icon" :class="option.icon" />

            <!-- Option Label -->
            <span class="option-label">
              {{ option.label }}

              <!-- Option Key -->
              <span v-if="option.key" class="option-key-wrapper">
                (<span class="option-key">{{ toUpperCase(option.key) }}</span>)
              </span>
            </span>

            <!-- Option Description -->
            <span v-if="option.description" class="option-description">
              {{ option.description }}
            </span>
          </div>

          <div class="option-item-right">
            <!-- Option Shortcut Key -->
            <span v-if="option.shortcutKey" class="option-shortcut">
              {{ formatShortcut(option.shortcutKey) }}
            </span>

            <!-- DropDown Icon -->
            <span v-if="option.childMenu" class="drop-down-icon" />

            <!-- 子菜单递归渲染 -->
            <div
              v-if="option.childMenu && hoveredOptionIndex === index"
              class="child-menu-wrapper"
            >
              <Menu class="child" :options="option.childMenu" />
            </div>
          </div>
        </li>
      </template>

      <!-- 分组菜单 -->
      <template v-if="'groupLabel' in option">
        <!-- Group Title -->
        <li class="option-group-header">
          <JeGroupHeader type="secondary">
            {{ option.groupLabel }}
          </JeGroupHeader>
        </li>

        <!-- Group Options -->
        <template
          v-for="(groupOption, groupIndex) in option.options"
          :key="groupOption.value"
        >
          <!-- 分割线 -->
          <li v-if="groupOption.isLine" class="option-line group">
            <hr>
          </li>

          <!-- 菜单项 -->
          <li
            v-else
            class="option-item"
            :class="{ hovered: groupOption.childMenu && hoveredOptionIndex === `${index}-${groupIndex}` }"
            @click="handleOptionClick(groupOption)"
            @mouseenter="setHoveredOption(`${index}-${groupIndex}`)"
          >
            <div class="option-item-left">
              <!-- Option Icon -->
              <span v-show="hasIcon" class="option-icon" :class="groupOption.icon" />

              <!-- Option Label -->
              <span class="option-label">
                {{ groupOption.label }}

                <!-- Option Key -->
                <span v-if="groupOption.key" class="option-key-wrapper">
                  (<span class="option-key">{{ toUpperCase(groupOption.key) }}</span>)
                </span>
              </span>

              <!-- Option Description -->
              <span v-if="groupOption.description" class="option-description">
                {{ groupOption.description }}
              </span>
            </div>

            <div class="option-item-right">
              <!-- Option Shortcut Key -->
              <span v-if="groupOption.shortcutKey" class="option-shortcut">
                {{ formatShortcut(groupOption.shortcutKey) }}
              </span>

              <!-- DropDown Icon -->
              <span v-if="groupOption.childMenu" class="drop-down-icon" />

              <!-- 子菜单递归渲染 -->
              <div
                v-if="groupOption.childMenu && hoveredOptionIndex === `${index}-${groupIndex}`"
                class="child-menu-wrapper"
              >
                <Menu class="child" :options="groupOption.childMenu" />
              </div>
            </div>
          </li>
        </template>
      </template>
    </template>
  </ul>
</template>

<style lang="scss" scoped>
.je-menu {
  @apply font-sans text-13px lh-25px;
  @apply b-solid b-1px rounded-5px;
  @apply p-7px m-0 min-w-150px;
  @apply relative z-1;
  @apply flex flex-col gap-5px;
  @apply list-none shadow-$shadow-popup cursor-default;

  // light
  @apply light:bg-$gray-14 light:b-$gray-9;

  // dark
  @apply dark:bg-$gray-2 dark:b-$gray-3;

  .menu-title {
    @apply color-$gray-7;
  }

  .option-item {
    @apply relative;
    @apply pl-10px pr-5px rounded-4px;
    @apply flex items-center justify-between gap-7px;
    @apply text-ellipsis whitespace-nowrap;

    &.hovered,
    &:hover {
      @apply light:bg-$blue-11 dark:bg-$blue-2;
    }

    .option-item-left,
    .option-item-right {
      @apply flex items-center gap-7px;
    }

    .option-icon {
      @apply size-0.7rem;
    }

    .option-label {
      @apply flex;
      @apply text-0.8rem mr-5px;
      @apply light:color-$gray-1 dark:color-$gray-12;

      .option-key-wrapper {
        @apply flex text-0.7rem;
        .option-key {
          @apply underline;
        }
      }
    }

    .option-shortcut {
      @apply text-0.7rem color-$gray-7;
    }

    .drop-down-icon {
      @apply light:i-jet:drop-down dark:i-jet:drop-down-dark;
      @apply light:size-0.5rem dark:size-0.5rem;
    }

    .child-menu-wrapper {
      @apply absolute top--10px left-full z-1;
    }
  }

  .option-line {
    hr {
      @apply flex-grow h-1px b-0 my-1px;

      @apply light:bg-$gray-12 dark:bg-$gray-3;
    }

    &.group hr {
      @apply ml-6px;
    }
  }
}
</style>
