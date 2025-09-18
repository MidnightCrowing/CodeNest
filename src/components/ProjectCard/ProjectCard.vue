<script lang="ts" setup>
import type { JeMenuOptionProps } from 'jetv-ui'
import { JeLink, JeMenu, JeTransparentToolButton } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import { showRemoveDialog } from '~/components/RemoveProjectDialog'
import { ViewEnum } from '~/constants/appEnums'
import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { openLink } from '~/utils/common'
import { initializeUpdateProjectState } from '~/views/ProjectEditorView'

import LanguageButton from './LanguageButton.vue'
import LicenseButton from './LicenseButton.vue'
import type { OpenButtonExpose } from './OpenButton.exposed'
import OpenButton from './OpenButton.vue'

const props = defineProps<{
  projectItem: LocalProject
}>()
const projectItem = toRef(props, 'projectItem')

const projectAppendTime = computed(() => projectItem.value.appendTime)
const projectPath = computed(() => projectItem.value.path)
const projectName = computed(() => projectItem.value.name)
const projectGroup = computed(() => projectItem.value.group)
const projectKind = computed(() => projectItem.value.kind)
const projectFromUrl = computed(() => projectItem.value.fromUrl)
const projectFromName = computed(() => projectItem.value.fromName)
const projectLangGroup = computed(() => projectItem.value.langGroup)
const projectDefaultOpen = computed(() => projectItem.value.defaultOpen)
const projectLicense = computed(() => projectItem.value.license)
const projectIsTemporary = computed(() => projectItem.value.isTemporary)
const projectExists = computed(() => projectItem.value.isExists)

const { t } = useI18n()

const projectCardRef = ref<HTMLDivElement | null>(null)
const openButtonRef = ref<OpenButtonExpose | null>(null)
const projectCardActive = ref<boolean>(false)
const langGroup = ref(projectLangGroup.value)

const formattedPath = ref<string>('')

function handleClick() {
  openButtonRef.value?.handleClick()
}

function handleDragStart(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', projectAppendTime.value.toString())
  }
}

watch(
  () => props.projectItem.langGroup,
  (newLangGroup, oldLangGroup) => {
    if (newLangGroup !== oldLangGroup) {
      langGroup.value = newLangGroup
    }
  },
  { deep: true },
) // 使用 deep 监听 langGroup 的内部变化

watchEffect(async () => {
  if (!projectPath.value) {
    formattedPath.value = ''
    return
  }
  formattedPath.value = await window.api.formatPath(projectPath.value)
})

// ==================== More Button ====================
async function copyProjectPath(): Promise<void> {
  const text = projectPath.value
  if (!text) {
    return
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    }
  }
  catch {}
}

function getDeleteLabel() {
  if (!projectExists.value) {
    return t('project_card.actions.remove')
  }
  return projectIsTemporary?.value === true
    ? t('project_card.actions.delete')
    : t('project_card.actions.remove')
}

const projectActions = computed<JeMenuOptionProps[]>(() => [
  {
    value: 'explorer:open',
    label: t('project_card.actions.open_in_explorer'),
    disabled: !projectExists.value,
    onClick: () => window.api.openInExplorer(projectPath.value),
  },
  {
    value: 'terminal:open',
    label: t('project_card.actions.open_in_terminal'),
    icon: 'light:i-jet:terminal dark:i-jet:terminal-dark',
    disabled: !projectExists.value,
    onClick: () => window.api.openInTerminal(projectPath.value),
  },
  {
    value: 'clipboard:copy',
    label: t('project_card.actions.copy_path'),
    icon: 'light:i-jet:copy dark:i-jet:copy-dark',
    disabled: !projectPath.value,
    onClick: copyProjectPath,
  },
  { value: 'line', isLine: true },
  {
    value: 'edit',
    label: t('project_card.actions.edit'),
    icon: 'light:i-jet:edit dark:i-jet:edit-dark',
    onClick: () => {
      initializeUpdateProjectState(props.projectItem)
      changeHomeView()
    },
  },
  {
    value: 'delete',
    label: getDeleteLabel(),
    labelColor: 'light:color-$red-4 dark:color-$red-6',
    icon: 'light:i-jet:delete?mask dark:i-jet:delete-dark?mask',
    iconColor: 'light:color-$red-4 dark:color-$red-6',
    onClick: () => showRemoveDialog(props.projectItem),
  },
])
const menuVisible = ref<boolean>(false)
const activatedView = inject('activatedView') as Ref<ViewEnum>

function changeHomeView() {
  if (activatedView)
    activatedView.value = ViewEnum.ProjectEditor
}

function showMenu() {
  menuVisible.value = true
}
</script>

<template>
  <div
    ref="projectCardRef"
    class="project-card group/item"
    :class="{ active: projectCardActive }"
    relative
    hover:bg="light:$gray-12 dark:$gray-3"
    active:bg="light:$gray-13 dark:$gray-2"
    p="10px"
    rounded="5px"
    flex="~ row justify-between"
    gap="10px"
    transition-all
    duration="150"
    ease-in-out
    cursor-pointer
    tabindex="0"
    draggable="true"
    @click="handleClick"
    @dragstart="handleDragStart"
  >
    <div
      :class="{ 'opacity-30': !projectExists }"
      flex="~ col justify-between"
      gap="8px"
      overflow-x-hidden
    >
      <!-- Info -->
      <div flex="~ col" gap="5px">
        <!-- Title -->
        <span flex="~ items-center" gap="5px">
          <template v-if="projectGroup">
            <span color="light:$yellow-5 dark:$yellow-9">{{ projectGroup }}</span>
            <span>/</span>
          </template>

          <span truncate>{{ projectName }}</span>

          <!-- Temporary Mark -->
          <span
            v-if="projectIsTemporary"
            text="medium"
            color="light:$yellow-5 dark:$yellow-9"
            b="solid 1px light:$yellow-5 dark:$yellow-9"
            rounded-full
            p="x-4px"
          >
            {{ t('project_card.temporary') }}
          </span>
        </span>

        <!-- Link -->
        <span
          v-if="
            (projectKind === ProjectKind.FORK || projectKind === ProjectKind.CLONE)
              && (projectFromUrl || projectFromName)
          "
          truncate
          text="secondary"
          @click.stop
        >
          {{ projectKind === ProjectKind.FORK ? 'Forked from' : 'Cloned from' }}
          <JeLink v-if="projectFromUrl" type="web" :on-click="() => openLink(projectFromUrl)">
            {{ projectFromName || projectFromUrl }}
          </JeLink>
          <span v-else>{{ projectFromName }}</span>
        </span>

        <!-- Path -->
        <span truncate text="secondary">{{ formattedPath }}</span>
      </div>

      <!-- Button -->
      <div flex="~ row" gap="15px">
        <LanguageButton :project-item="projectItem" @click.stop />

        <LicenseButton
          v-if="projectLicense && projectLicense !== LicenseEnum.NONE"
          :license="projectLicense"
          @click.stop
        />
      </div>
    </div>

    <div flex="~ row items-center" gap="10px">
      <OpenButton
        v-if="projectExists"
        ref="openButtonRef"
        :append-time="projectAppendTime"
        :default-open="projectDefaultOpen"
        :project-path="projectPath"
        @click.stop
      />

      <!-- More Button -->
      <JeTransparentToolButton
        p="3px"
        icon="light:i-jet:more-vertical dark:i-jet:more-vertical-dark"
        icon-size="17px"
        @click.stop="showMenu"
      />
      <JeMenu
        v-model:visible="menuVisible"
        :options="projectActions"
        absolute
        translate-y="45px"
        right="5px"
        @click.stop
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.je-link:not(.disabled) {
  @apply dark:color-$blue-6;
}
</style>
