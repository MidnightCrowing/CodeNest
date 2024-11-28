<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { JeCard, JeInputField, JeTransparentButton, JeTransparentToolButton } from '~/jetv-ui'

const props = defineProps<{
  modelValue: string | null
}>()
const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const initialPathValue = props.modelValue // 保存初始值
const codeEditorPath = ref(props.modelValue)
const isPanelOpen = ref(false) // 控制面板展开状态

// 检查是否有修改
const isModified = computed(() => codeEditorPath.value !== initialPathValue)

// 打开文件夹选择对话框
async function openFolder() {
  const fileTypes = [
    { name: 'Executable Files', extensions: ['exe', 'bat', 'cmd'] },
    { name: 'All Files', extensions: ['*'] },
  ]

  const selectedPaths = await window.api.openFileDialog(fileTypes)
  if (selectedPaths.length > 0) {
    changePathValue(selectedPaths[0])
  }
}

// 修改路径的值
function changePathValue(path: string | null) {
  codeEditorPath.value = path
  emit('update:modelValue', codeEditorPath.value)
}

// 切换面板展开状态
function togglePanel() {
  isPanelOpen.value = !isPanelOpen.value
}

// 重置路径到初始值
function resetPath() {
  changePathValue(initialPathValue)
}
</script>

<template>
  <div flex="~ col" gap="1px">
    <!-- 卡片部分 -->
    <JeCard
      p="15px"
      flex="~ items-center justify-between"
      @click="togglePanel"
    >
      <div flex="~ items-center" gap="3px">
        <slot />

        <!-- 只有在修改设置项时显示重置按钮 -->
        <JeTransparentToolButton
          v-if="isModified"
          p="1px"
          text="light:$blue-4 dark:$blue-6"
          icon="light:i-jet:reset?mask dark:i-jet:reset-dark?mask"
          @click.stop="resetPath"
          @keydown.enter="resetPath"
        />
      </div>

      <div flex="~ items-center" gap="10px" text="$gray-8">
        {{ codeEditorPath || t('settings.ides_path.none') }}
        <JeTransparentToolButton
          class="toggle-button"
          :class="{ rotated: isPanelOpen }"
          p="3px"
          icon="light:i-jet:chevron-down dark:i-jet:chevron-down-dark"
          icon-size="20px"
          @keydown.enter="togglePanel"
        />
      </div>
    </JeCard>

    <!-- 折叠面板 -->
    <div
      class="collapsible-panel" overflow-hidden max-h-0
      :class="{ open: isPanelOpen }"
    >
      <div class="panel-content" bg="light:$gray-12 dark:$gray-3" p="15px" flex="~ row items-center" gap="10px">
        <JeInputField
          v-model="codeEditorPath"
          :tabindex="isPanelOpen ? 0 : -1"
          w="300px"
        />
        <JeTransparentButton
          class="browse-button"
          :tabindex="isPanelOpen ? 0 : -1"
          @click="openFolder"
        >
          {{ t('settings.ides_path.browse') }}
        </JeTransparentButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.collapsible-panel {
  transition: max-height 0.3s ease-in-out;

  &.open {
    max-height: 100px;
  }
}

.browse-button {
  @apply light:bg-$gray-10 dark:bg-$gray-5 hover:bg-$toolbar-hover active:bg-$toolbar-active;
}
</style>

<style lang="scss">
.toggle-button .je-transparent-tool-button__icon {
  transition: transform 0.3s ease-in-out;
}

.toggle-button.rotated .je-transparent-tool-button__icon {
  transform: rotate(180deg);
}
</style>
