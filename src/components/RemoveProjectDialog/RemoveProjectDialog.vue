<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { showToast } from '~/components/ui/toast'
import UiCheckbox from '~/components/ui/UiCheckbox.vue'
import UiDialog from '~/components/ui/UiDialog.vue'
import type { LocalProject } from '~/constants/localProject'
import { useProjectsStore } from '~/stores/projectsStore'
import { canDeleteProjectFiles } from '~/utils/projectCapabilities'

import { hideRemoveDialog, isDialogVisible, playRemoveAnimation, projectToRemove } from './RemoveProjectDialogProvider'

const { t } = useI18n()
const projectsStore = useProjectsStore()

// 关闭动画期间 projectToRemove 已被清空，保留最后一次的项目避免文案闪成空值
const displayedProject = shallowRef<LocalProject | null>(projectToRemove.value)
const deleteFiles = ref(false)
const labelSwapRef = ref<HTMLElement | null>(null)
const labelWidth = ref('')

const canDeleteFiles = computed(() => {
  const project = displayedProject.value
  return project ? canDeleteProjectFiles(project) : false
})
const willDeleteFiles = computed(() => deleteFiles.value && canDeleteFiles.value)

// 弹窗已打开时再次 showRemoveDialog 不会让 isDialogVisible 变化，
// 所以换项目这件事必须盯 projectToRemove，否则上一个项目的勾选会带过来
watch(projectToRemove, (project) => {
  if (!project)
    return

  displayedProject.value = project
  deleteFiles.value = false
})

// 每次打开都从未勾选开始，避免上一次的选择误伤下一个项目
watch(isDialogVisible, (visible) => {
  if (!visible)
    return

  deleteFiles.value = false
  // 丢掉上一次量到的宽度，否则换语言后会用旧宽度裁掉入场那几帧的文字
  labelWidth.value = ''
})

// 两个文案叠在同一个网格单元里，量出当前那个的宽度写死到容器上，
// 这样按钮既贴合文本宽度，切换时又能把宽度过渡出来而不是瞬间跳变。
// 必须用 offsetWidth：弹窗入场动画带 scale(0.985)，
// getBoundingClientRect() 会把这个缩放算进去，量出来偏窄会把文字裁掉。
function measureLabelWidth() {
  const active = labelSwapRef.value?.querySelector<HTMLElement>(
    willDeleteFiles.value ? '.label-delete' : '.label-remove',
  )

  // 布局还没发生时会量到 0，这种结果要丢掉，否则文字会被压成一条缝
  const width = active?.offsetWidth ?? 0
  if (width > 0)
    labelWidth.value = `${width + 1}px` // +1 兜住 offsetWidth 取整带来的亚像素裁切
}

async function syncLabelWidth() {
  await nextTick()
  measureLabelWidth()
  requestAnimationFrame(measureLabelWidth)
}

watch([labelSwapRef, willDeleteFiles], () => {
  void syncLabelWidth()
})

// delete_project 从不 reject：路径不存在、非绝对路径、系统目录、IO 失败都是
// 正常 resolve 出 { success: false, error }，只挂 .catch 会让失败被静默吞掉
async function deleteProjectFiles(project: LocalProject) {
  let reason: unknown

  try {
    const result = await window.api.deleteProject(project.path)
    if (result?.success)
      return

    reason = result?.error
  }
  catch (error) {
    reason = error
  }

  console.error('Delete project files failed:', reason)
  showToast({
    title: t('app.home.feedback.delete_files_failed'),
    description: project.name,
    tone: 'error',
  })
}

function confirmRemove() {
  const project = projectToRemove.value
  if (!project) {
    hideRemoveDialog()
    return
  }

  const projectId = project.appendTime

  if (willDeleteFiles.value)
    void deleteProjectFiles(project)

  hideRemoveDialog()

  // 播放动画后再删除数据
  void playRemoveAnimation(projectId)
    .catch((error) => {
      console.error('Remove animation failed:', error)
    })
    .finally(() => {
      projectsStore.removeProject(projectId)
    })
}
</script>

<template>
  <UiDialog
    :open="isDialogVisible"
    @update:open="open => !open && hideRemoveDialog()"
  >
    <template #title>
      {{ t('remove_project_dialog.dialog_title') }}
    </template>

    <template #description>
      {{ t('remove_project_dialog.dialog_desc', { name: displayedProject?.name }) }}
    </template>

    <div class="delete-note" :class="{ visible: willDeleteFiles }">
      <div overflow-hidden>
        <p mt-8px mb-0 text-13px lh-18px color="$red-5">
          {{ t('remove_project_dialog.delete_files_note') }}
        </p>
      </div>
    </div>

    <template #actions-start>
      <UiCheckbox
        v-model="deleteFiles"
        :disabled="!canDeleteFiles"
        :aria-label="t('remove_project_dialog.delete_files')"
      >
        {{ t('remove_project_dialog.delete_files') }}
      </UiCheckbox>
    </template>

    <template #actions>
      <button class="danger-button" type="button" @click="confirmRemove">
        <span
          ref="labelSwapRef"
          class="label-swap"
          :class="{ 'delete-mode': willDeleteFiles }"
          :style="labelWidth ? { width: labelWidth } : undefined"
        >
          <span class="label-remove">{{ t('remove_project_dialog.remove') }}</span>
          <span class="label-delete">{{ t('remove_project_dialog.remove_and_delete') }}</span>
        </span>
      </button>
      <button class="ghost-button" type="button" @click="hideRemoveDialog">
        {{ t('remove_project_dialog.cancel') }}
      </button>
    </template>
  </UiDialog>
</template>

<style lang="scss" scoped>
/* 时长与缓动沿用全局的 120ms / cubic-bezier(0.16, 1, 0.3, 1) */
.delete-note {
  display: grid;
  grid-template-rows: 0fr;
  transition:
    grid-template-rows 120ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 100ms ease-out;
  @apply opacity-0;

  &.visible {
    grid-template-rows: 1fr;
    @apply opacity-100;
  }
}

.label-swap {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  @apply items-center justify-items-center overflow-hidden;
  transition: width 120ms cubic-bezier(0.16, 1, 0.3, 1);

  > span {
    grid-area: 1 / 1;
    @apply whitespace-nowrap;
    transition: opacity 100ms ease-out;
  }

  .label-delete {
    @apply opacity-0;
  }

  &.delete-mode {
    .label-remove {
      @apply opacity-0;
    }

    .label-delete {
      @apply opacity-100;
    }
  }
}
</style>
