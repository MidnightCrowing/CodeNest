<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { showDeleteDialog } from '~/components/DeleteProjectDialog/DeleteProjectDialogProvider'
import { initializeUpdateProjectState } from '~/components/ProjectConfig/ProjectConfigProvider'
import { ViewEnum } from '~/constants/appEnums'
import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { JeLink, JeMiniMenu, JeTransparentToolButton } from '~/jetv-ui'
import { openLink } from '~/utils/main'

import LanguageButton from './LanguageButton.vue'
import LicenseButton from './LicenseButton.vue'
import OpenButton from './OpenButton.vue'

const props = defineProps<{
  projectItem: LocalProject
}>()
const {
  path: projectPath,
  name: projectName,
  kind: projectKind,
  fromUrl: projectFromUrl,
  fromName: projectFromName,
  mainLang: projectMainLang,
  mainLangColor: projectMainLangColor,
  langGroup: projectLangGroup,
  defaultOpen: projectDefaultOpen,
  license: projectLicense,
} = toRefs(props.projectItem)

const { t } = useI18n()

const projectCard = ref<HTMLDivElement | null>(null)
const projectCardActive = ref(false)
const langGroup = ref(projectLangGroup)

// eslint-disable-next-line unused-imports/no-unused-vars
function handleClick(path: string) {
  projectCardActive.value = true
}

function handleClicked() {
  projectCardActive.value = false
}

watch(() => props.projectItem.langGroup, (newLangGroup, oldLangGroup) => {
  if (newLangGroup !== oldLangGroup) {
    langGroup.value = newLangGroup
  }
}, { deep: true }) // 使用 deep 监听 langGroup 的内部变化

// ==================== More Button ====================
const menuVisible = ref(false)
const activatedView = inject('activatedView') as Ref<ViewEnum>

function changeHomeView() {
  if (activatedView)
    activatedView.value = ViewEnum.NewProject
}

function showMenu() {
  menuVisible.value = true
}

function updateProject() {
  initializeUpdateProjectState(props.projectItem)
  changeHomeView()
}

function deleteProject() {
  showDeleteDialog(props.projectItem)
}
</script>

<template>
  <div
    ref="projectCard"
    class="project-card group/item"
    :class="{ active: projectCardActive }"
    relative
    hover:bg="light:$gray-12 dark:$gray-3"
    p="10px" rounded="5px"
    flex="~ row justify-between" gap="10px"
    transition-all duration="150" ease-in-out
    cursor-pointer
    @mousedown="handleClick(projectPath)"
    @mouseup="handleClicked"
  >
    <div flex="~ col justify-between" gap="8px" overflow-x-hidden>
      <!-- Info -->
      <div flex="~ col" gap="5px">
        <!-- Title -->
        <span flex="~ items-center" gap="5px">
          <span truncate>{{ projectName }}</span>

          <!-- Test Mark -->
          <span
            v-if="(projectKind === ProjectKind.TEST)"
            text="medium"
            color="light:$yellow-5 dark:$yellow-9"
            b="solid 1px light:$yellow-5 dark:$yellow-9" rounded-full
            p="x-4px"
          >
            Test
          </span>
        </span>

        <!-- Link -->
        <span
          v-if="(projectKind === (ProjectKind.FORK || ProjectKind.CLONE)) && (projectFromUrl || projectFromName)"
          truncate text="secondary"
        >
          {{ projectKind === ProjectKind.FORK ? 'Forked from' : 'Cloned from' }}
          <JeLink
            v-if="projectFromUrl"
            type="web"
            :on-click=" () => openLink(projectFromUrl) "
            @mousedown.stop @mouseup.stop
          >
            {{ projectFromName || projectFromUrl }}
          </JeLink>
          <span v-else>{{ projectFromName }}</span>
        </span>

        <!-- Path -->
        <span truncate text="secondary">{{ projectPath }}</span>
      </div>

      <!-- Button -->
      <div flex="~ row" gap="15px">
        <LanguageButton
          :main-lang="projectMainLang"
          :main-lang-color="projectMainLangColor"
          :lang-group="langGroup"
        />

        <LicenseButton
          v-if="projectLicense && projectLicense !== LicenseEnum.NONE"
          :license="projectLicense"
        />
      </div>
    </div>

    <div flex="~ row items-center" gap="10px">
      <OpenButton
        class="group-hover/item:block"
        :default-open="projectDefaultOpen"
        :project-path="projectPath"
        hidden
      />

      <!-- More Button -->
      <JeTransparentToolButton
        p="3px"
        icon="light:i-jet:more-vertical dark:i-jet:more-vertical-dark"
        icon-size="17px"
        @click="showMenu"
        @mousedown.stop @mouseup.stop
      />
      <JeMiniMenu
        v-model:visible="menuVisible"
        :options="[
          { value: 'update',
            label: t('project_card.update'),
            icon: 'light:i-jet:edit dark:i-jet:edit-dark',
            onClick: () => updateProject() },
          { value: 'delete',
            label: t('project_card.delete'),
            labelColor: 'light:color-$red-4 dark:color-$red-6',
            icon: 'light:i-jet:delete dark:i-jet:delete-dark',
            onClick: () => deleteProject() },
        ]"
        absolute translate-y="45px" right="5px"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project-card.active {
  @apply active:light:bg-$gray-13 active:dark:bg-$gray-2;
}

.je-link:not(.disabled) {
  @apply dark:color-$blue-6;
}
</style>
