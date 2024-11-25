<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core'

import { capitalize, toUpperCase } from '../../utils/main'
import { JeGroup, JeLine, JePopup } from '../index'
import type { MenuOptionProps, MenuProps } from './types'

const props = withDefaults(defineProps<MenuProps>(), {
  visible: false,
  isChildMenu: false,
})
const emit = defineEmits(['update:visible', 'close'])

const menuRef = ref<HTMLElement | null>(null) // 菜单的根元素
const isMenuOpen = ref(props.visible) // 控制菜单的显示状态
const hoveredOptionIndex = ref<string | number | null>(null) // 当前鼠标悬停的选项索引
const childMenuPosition = ref<'right' | 'left'>('right') // 子菜单显示的位置（右或左）

const hasIcon = computed(() => {
  return props.options.some((option) => {
    // 如果是 OptionGroup，检查其 options 内的每个 Option
    if ('options' in option) {
      return option.options.some(opt => !!opt.icon)
    }
    // 如果是单个 Option，直接检查 icon
    return !!option.icon
  })
})

/** 外部点击关闭菜单 */
onClickOutside(menuRef, () => {
  if (!props.isChildMenu) {
    closeMenu()
  }
})

/** Watchers */
watch(() => props.visible, (newVal) => {
  isMenuOpen.value = newVal
  if (isMenuOpen.value) {
    setHoveredOption(null) // 重新显示菜单时清除悬停选项
  }
})

watch(isMenuOpen, (newVal) => {
  if (newVal) {
    checkMenuPosition() // 打开菜单时检查子菜单位置
  }
})

// ==================== 方法 ====================

/**
 * 设置当前鼠标悬停的选项索引
 * @param index - 当前悬停的选项索引
 */
function setHoveredOption(index: string | number | null) {
  hoveredOptionIndex.value = index
}

/**
 * 处理选项点击事件
 * @param option - 被点击的菜单项
 */
function handleOptionClick(option: MenuOptionProps) {
  if (option.onClick) {
    option.onClick() // 调用选项的 onClick 回调函数
  }

  if (!option.childMenu) {
    closeMenu() // 如果没有子菜单，关闭菜单
  }

  if (props.isChildMenu) {
    emit('close') // 子菜单触发关闭事件
  }
}

/**
 * 格式化快捷键字符串
 * @param keys - 快捷键数组
 * @returns {string} 格式化后的快捷键字符串
 */
function formatShortcut(keys: string[]): string {
  return keys
    .map(key => capitalize(key))
    .join('+')
}

/**
 * 关闭菜单
 */
function closeMenu() {
  isMenuOpen.value = false
  emit('update:visible', false)
}

/**
 * 检查菜单位置并调整子菜单的显示位置
 */
function checkMenuPosition() {
  nextTick(() => {
    if (menuRef.value instanceof HTMLElement) {
      const menuRect = menuRef.value.getBoundingClientRect()
      const screenWidth = window.innerWidth
      const isOutOfBounds = menuRect.right + 200 > screenWidth // 子菜单宽度预估为 200px

      childMenuPosition.value = isOutOfBounds ? 'left' : 'right'
    }
  })
}
</script>

<template>
  <JePopup
    v-if="isMenuOpen && options"
    ref="menuRef"
    class="je-menu"
  >
    <ul class="je-menu__ul">
      <!-- 菜单标题 -->
      <li v-if="title" class="je-menu__title">
        {{ title }}
      </li>

      <template v-for="(option, index) in options" :key="option.value">
        <!-- 单项菜单 -->
        <template v-if="!('groupLabel' in option)">
          <!-- 分割线 -->
          <li v-if="option.isLine" class="je-menu__option-line">
            <JeLine />
          </li>

          <!-- 菜单项 -->
          <li
            v-else
            class="je-menu__option-item"
            :class="{ hovered: option.childMenu && hoveredOptionIndex === index }"
            @click="handleOptionClick(option)"
            @mouseenter="setHoveredOption(index)"
          >
            <div class="je-menu__option-item-left">
              <!-- Option Icon -->
              <span v-show="hasIcon" class="je-menu__option-icon" :class="option.icon" />

              <!-- Option Label -->
              <span class="je-menu__option-label" :style="{ color: option.labelColor }">
                {{ option.label }}

                <!-- Option Key -->
                <span v-if="option.key" class="je-menu__option-key-wrapper">
                  (<span class="je-menu__option-key">{{ toUpperCase(option.key) }}</span>)
                </span>

                <!-- Ellipsis -->
                <span v-if="option.ellipsis" class="je-menu__option-ellipsis">
                  ...
                </span>
              </span>

              <!-- Option Description -->
              <span v-if="option.description" class="je-menu__option-description">
                {{ option.description }}
              </span>
            </div>

            <div class="je-menu__option-item-right">
              <!-- Option Shortcut Key -->
              <span v-if="option.shortcutKey" class="je-menu__option-shortcut">
                {{ formatShortcut(option.shortcutKey) }}
              </span>

              <!-- Dropdown Icon -->
              <span v-if="option.childMenu" class="je-menu__icon-drop-down" />

              <!-- 子菜单递归渲染 -->
              <div
                v-if="option.childMenu && hoveredOptionIndex === index"
                class="je-menu__child-menu-wrapper"
                :style="{ left: childMenuPosition === 'right' ? '100%' : 'auto', right: childMenuPosition === 'left' ? '100%' : 'auto' }"
              >
                <MenuProps
                  class="child"
                  :visible="true"
                  :title="option.childMenu.title"
                  :options="option.childMenu.options"
                  :is-child-menu="true"
                  @close="closeMenu"
                />
              </div>
            </div>
          </li>
        </template>

        <!-- 分组菜单 -->
        <template v-if="'groupLabel' in option">
          <!-- Group Title -->
          <li class="je-menu__option-group-header">
            <JeGroup :label="option.groupLabel" :is-expand="option.isExpand ?? true" label-type="secondary">
              <!-- Group Options -->
              <template
                v-for="(groupOption, groupIndex) in option.options"
                :key="groupOption.value"
              >
                <!-- 分割线 -->
                <li v-if="groupOption.isLine" class="je-menu__option-line je-menu__option-group">
                  <JeLine />
                </li>

                <!-- 菜单项 -->
                <li
                  v-else
                  class="je-menu__option-item"
                  :class="{ hovered: groupOption.childMenu && hoveredOptionIndex === `${index}-${groupIndex}` }"
                  @click="handleOptionClick(groupOption)"
                  @mouseenter="setHoveredOption(`${index}-${groupIndex}`)"
                >
                  <div class="je-menu__option-item-left">
                    <!-- Option Icon -->
                    <span v-show="hasIcon" class="je-menu__option-icon" :class="groupOption.icon" />

                    <!-- Option Label -->
                    <span class="je-menu__option-label" :style="{ color: groupOption.labelColor }">
                      {{ groupOption.label }}

                      <!-- Option Key -->
                      <span v-if="groupOption.key" class="je-menu__option-key-wrapper">
                        (<span class="je-menu__option-key">{{ toUpperCase(groupOption.key) }}</span>)
                      </span>

                      <!-- Ellipsis -->
                      <span v-if="groupOption.ellipsis" class="je-menu__option-ellipsis">
                        ...
                      </span>
                    </span>

                    <!-- Option Description -->
                    <span v-if="groupOption.description" class="je-menu__option-description">
                      {{ groupOption.description }}
                    </span>
                  </div>

                  <div class="je-menu__option-item-right">
                    <!-- Option Shortcut Key -->
                    <span v-if="groupOption.shortcutKey" class="je-menu__option-shortcut">
                      {{ formatShortcut(groupOption.shortcutKey) }}
                    </span>

                    <!-- Dropdown Icon -->
                    <span v-if="groupOption.childMenu" class="je-menu__icon-drop-down" />

                    <!-- 子菜单递归渲染 -->
                    <div
                      v-if="groupOption.childMenu && hoveredOptionIndex === `${index}-${groupIndex}`"
                      class="je-menu__child-menu-wrapper"
                      :style="{ left: childMenuPosition === 'right' ? '100%' : 'auto', right: childMenuPosition === 'left' ? '100%' : 'auto' }"
                    >
                      <MenuProps
                        class="je-menu__child"
                        :visible="true"
                        :title="groupOption.childMenu.title"
                        :options="groupOption.childMenu.options"
                        :is-child-menu="true"
                        @close="closeMenu"
                      />
                    </div>
                  </div>
                </li>
              </template>
            </JeGroup>
          </li>
        </template>
      </template>
    </ul>
  </JePopup>
</template>

<style lang="scss" scoped>
.je-menu {
  @apply font-sans text-13px lh-25px;
  @apply min-w-150px overflow-y-auto;
  @apply cursor-default;
}

.je-menu__ul {
  @apply p-7px m-0;
  @apply list-none;
}

.je-menu__title {
  @apply color-$gray-7;
}

.je-menu__option-item {
  @apply relative;
  @apply pl-10px pr-5px rounded-4px;
  @apply flex items-center justify-between gap-7px;
  @apply text-ellipsis whitespace-nowrap;

  &.hovered,
  &:hover {
    @apply light:bg-$blue-11 dark:bg-$blue-2;
  }
}

.je-menu__option-item-left,
.je-menu__option-item-right {
  @apply flex items-center gap-7px;
}

.je-menu__option-icon {
  @apply size-0.7rem;
}

.je-menu__option-label {
  @apply flex;
  @apply text-0.8rem mr-5px;
  @apply light:color-$gray-1 dark:color-$gray-12;
}

.je-menu__option-key-wrapper {
  @apply flex text-0.7rem;
}

.je-menu__option-key {
  @apply underline;
}

.je-menu__option-description,
.je-menu__option-shortcut {
  @apply text-0.7rem color-$gray-7;
}

.je-menu__icon-drop-down {
  @apply text-0.5rem;
  @apply light:i-jet:drop-down dark:i-jet:drop-down-dark;
}

.je-menu__child-menu-wrapper {
  @apply absolute top--10px z-1;
}

.je-menu__option-line {
  JeLine {
    @apply my-1px;
  }

  &.je-menu__option-group JeLine {
    @apply ml-6px;
  }
}
</style>
