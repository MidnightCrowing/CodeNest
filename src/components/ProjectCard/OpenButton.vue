<script lang="ts" setup>
import { JeButton } from 'jetv-ui'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { showNoIdePathDialog } from '~/components/NoIdePathDialog'
import { codeEditors } from '~/constants/codeEditor'
import type { LocalProject } from '~/constants/localProject'
import { useProjectsStore } from '~/stores/projectsStore'
import { useSettingsStore } from '~/stores/settingsStore'

const props = defineProps<{
  appendTime: LocalProject['appendTime']
  defaultOpen: LocalProject['defaultOpen']
  projectPath: LocalProject['path']
}>()

const { t } = useI18n()

const settingsStore = useSettingsStore()
const projectsStore = useProjectsStore()
const isOpening = ref(false)

function handleClick() {
  if (isOpening.value) {
    return // 防止多次点击
  }

  const idePath = settingsStore.codeEditorsPath[props.defaultOpen]

  if (!idePath) {
    showNoIdePathDialog()
    return
  }

  isOpening.value = true

  // 打开项目
  window.api.openProject(idePath, props.projectPath)

  // 模拟反馈
  setTimeout(() => {
    isOpening.value = false
  }, 2000)

  // 置顶项目
  projectsStore.moveProjectToTopByTime(props.appendTime)
}

defineExpose({
  handleClick,
})
</script>

<template>
  <div v-if="isOpening" text="default">
    {{ t('project_card.opening') }}
  </div>
  <JeButton
    v-else
    class="group-hover/item:block"
    type="primary"
    hidden
    :disabled="isOpening"
    @click="handleClick"
  >
    <span flex="~ items-center" gap="5px" color="$gray-12">
      <span :class="codeEditors[defaultOpen].icon" />
      <span>{{ codeEditors[defaultOpen].label }}</span>
    </span>
  </JeButton>
</template>
