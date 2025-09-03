<script lang="ts" setup>
import { JeFrame, JeLine, JeTransparentToolButton } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import SideMenuButton from '~/components/SideMenuButton.vue'
import { ViewEnum } from '~/constants/appEnums'
import { ProjectKind } from '~/constants/localProject'
import { useProjectsStore } from '~/stores/projects'

import type { SidePanelActive } from './types'

const props = defineProps<{
  activatedItem: SidePanelActive
}>()
const emit = defineEmits(['updateActivatedItem'])

const { t } = useI18n()
const projects = useProjectsStore()

// 通过点击更新激活项
function updateActivatedItem(itemMark: SidePanelActive) {
  if (props.activatedItem !== itemMark) {
    emit('updateActivatedItem', itemMark)
  }
}

// ==================== Kind Group ====================
const kinds = computed(() => [
  { kind: 'all' as const, label: t('home.side_panel.kinds.all') },
  { kind: 'mine' as const, label: t('home.side_panel.kinds.mine'), projectKind: ProjectKind.MINE },
  { kind: 'fork' as const, label: t('home.side_panel.kinds.fork'), projectKind: ProjectKind.FORK },
  { kind: 'clone' as const, label: t('home.side_panel.kinds.clone'), projectKind: ProjectKind.CLONE },
])
// 使用 map 方法动态生成 Kind Group 数据
const kindMenuGroup1 = computed(() =>
  kinds.value.map(({ kind, label, projectKind }) => ({
    kind,
    label,
    count: projectKind
      ? projects.getProjectsByKind(projectKind).length
      : projects.allProjects.length,
  })),
)

function handleTempDrop(event: DragEvent) {
  const data = event.dataTransfer?.getData('text/plain')
  if (data) {
    const appendTime = Number(data) // 转换为数字

    const project = projects.getProjectByAppendTime(appendTime)
    if (project) {
      project.isTemporary = !project.isTemporary
      projects.updateProject(appendTime, project)
    }
  }
}

// ==================== Language Group ====================
const languagesGroup = computed(() => {
  return [...projects.mainLangSummary]
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count // 按 count 降序
      }
      return a.text.localeCompare(b.text) // 如果 count 相同，则按 text 升序
    })
})

// ==================== Settings Bottom ====================
const activatedView = inject('activatedView') as Ref<ViewEnum>

function changeSettingsView() {
  if (activatedView)
    activatedView.value = ViewEnum.Settings
}
</script>

<template>
  <JeFrame
    type="secondary"
    m-t="1px"
    b="solid x-4px y-8px white light:$gray-13 dark:$gray-2"
    flex="~ col justify-between" gap="5px"
  >
    <JeFrame
      type="secondary"
      p="x-4px"
      flex="~ col" gap="1px"
      overflow-auto
    >
      <!-- Kind Group -->
      <header text="default-semibold" p="x-10px t-12px b-8px">
        {{ t('home.side_panel.projects') }}
      </header>
      <main flex="~ col" gap="1px">
        <template v-for="kindItem in kindMenuGroup1" :key="kindItem.kind">
          <SideMenuButton
            :active="activatedItem === `k-${kindItem.kind}`"
            :tag-value="kindItem.count"
            @click="updateActivatedItem(`k-${kindItem.kind}`)"
            @keydown.enter="updateActivatedItem(`k-${kindItem.kind}`)"
          >
            {{ kindItem.label }}
          </SideMenuButton>
        </template>

        <JeLine mx-10px />

        <!-- Temporary -->
        <SideMenuButton
          :active="activatedItem === 'temp'"
          :tag-value="projects.tempProjects.length"
          @click="updateActivatedItem('temp')"
          @keydown.enter="updateActivatedItem('temp')"
          @dragover.prevent
          @drop="handleTempDrop"
        >
          {{ t('home.side_panel.temporary') }}
        </SideMenuButton>
      </main>

      <!-- Language Group -->
      <template v-if="languagesGroup.length > 0">
        <header text="default-semibold" p="x-10px t-12px b-8px">
          {{ t('home.side_panel.languages') }}
        </header>
        <main flex="~ col" gap="1px">
          <SideMenuButton
            v-for="languageItem in languagesGroup"
            :key="languageItem.text"
            :active="activatedItem === `l-${languageItem.text}`"
            :color-value="languageItem.color"
            :tag-value="languageItem.count"
            @click="updateActivatedItem(`l-${languageItem.text}`)"
            @keydown.enter="updateActivatedItem(`l-${languageItem.text}`)"
          >
            {{ languageItem.text }}
          </SideMenuButton>
        </main>
      </template>
    </JeFrame>

    <div p="4px t-2px">
      <JeTransparentToolButton
        p="6px"
        icon="light:i-jet:settings dark:i-jet:settings-dark"
        icon-size="17px"
        @click="changeSettingsView"
        @keydown.enter="changeSettingsView"
      />
    </div>
  </JeFrame>
</template>
