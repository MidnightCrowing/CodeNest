<script lang="ts" setup>
import { JeFrame, JeLine, JeTransparentToolButton } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import SideMenuButton from '~/components/SideMenuButton.vue'
import { ViewEnum } from '~/constants/appEnums'
import { ProjectKind } from '~/constants/localProject'
import { projectManager } from '~/core/main'

const props = defineProps<{
  activatedItem: string
}>()
const emit = defineEmits(['updateActivatedItem'])

const { t } = useI18n()

// 通过点击更新激活项
function updateActivatedItem(itemMark: string) {
  if (props.activatedItem !== itemMark) {
    emit('updateActivatedItem', itemMark)
  }
}

// ==================== Kind Group ====================
const kinds = computed(() => [
  { kind: 'all', label: t('home.side_panel.kinds.all') },
  { kind: 'mine', label: t('home.side_panel.kinds.mine'), projectKind: ProjectKind.MINE },
  { kind: 'fork', label: t('home.side_panel.kinds.fork'), projectKind: ProjectKind.FORK },
  { kind: 'clone', label: t('home.side_panel.kinds.clone'), projectKind: ProjectKind.CLONE },
  { kind: 'test', label: t('home.side_panel.kinds.test'), projectKind: ProjectKind.TEST },
])
// 使用 map 方法动态生成 Kind Group 数据
const kindMenuGroups = computed(() =>
  kinds.value.map(({ kind, label, projectKind }) => ({
    kind,
    label,
    count: projectKind
      ? projectManager.getProjectsByKind(projectKind).length
      : projectManager.getProjects().length,
  })),
)
// 分组 Kind Group1 和 Kind Group2
const kindMenuGroup1 = computed(() => kindMenuGroups.value.slice(0, 4)) // 包含 all, mine, fork, clone
const kindMenuGroup2 = computed(() => kindMenuGroups.value.slice(4)) // 包含 test

// ==================== Language Group ====================
const languagesGroup = computed(() => {
  return projectManager.getMainLangSummary()
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
        <SideMenuButton
          v-for="kindItem in kindMenuGroup1"
          :key="kindItem.kind"
          :active="activatedItem === `k-${kindItem.kind}`"
          :tag-value="kindItem.count"
          @click="updateActivatedItem(`k-${kindItem.kind}`)"
          @keydown.enter="updateActivatedItem(`k-${kindItem.kind}`)"
        >
          {{ kindItem.label }}
        </SideMenuButton>
        <JeLine mx-10px />
        <SideMenuButton
          v-for="kindItem in kindMenuGroup2"
          :key="kindItem.kind"
          :active="activatedItem === `k-${kindItem.kind}`"
          :tag-value="kindItem.count"
          @click="updateActivatedItem(`k-${kindItem.kind}`)"
        >
          {{ kindItem.label }}
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
