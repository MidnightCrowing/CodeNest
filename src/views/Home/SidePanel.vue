<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import SideMenuButtonBase from '~/components/SideMenuButton.vue'
import type { ProjectLanguageInfo } from '~/constants/projectLanguage'
import { JeFrame, JeLine } from '~/jetv-ui'

const { t } = useI18n()

// Side Panel
const activatedItem: Ref<string> = ref('k-all')

function updateActivatedItem(itemMark: string) {
  if (activatedItem.value !== itemMark)
    activatedItem.value = itemMark
}

// Kind Group
const kindMenuGroup1: { kind: string, label: string }[] = [
  { kind: 'all', label: t('home.side_panel.kinds.all') },
  { kind: 'mine', label: t('home.side_panel.kinds.mine') },
  { kind: 'fork', label: t('home.side_panel.kinds.fork') },
  { kind: 'clone', label: t('home.side_panel.kinds.clone') },
]
const kindMenuGroup2: { kind: string, label: string }[] = [
  { kind: 'test', label: t('home.side_panel.kinds.test') },
]

// Language Group
const languagesGroup: ProjectLanguageInfo[] = [
  { text: 'JavaScript', color: '#f1e05a' },
  { text: 'HTML', color: '#e34c26' },
  { text: 'Java', color: '#b07219' },
  { text: 'Python', color: '#3572a5' },
  { text: 'TypeScript', color: '#3178c6' },
  { text: 'Jupyter Notebook', color: '#da5b0b' },
  { text: 'C#', color: '#178600' },
  { text: 'CSS', color: '#563d7c' },
  { text: 'Ruby', color: '#701516' },
  { text: 'C++', color: '#f34b7d' },
]
</script>

<template>
  <JeFrame
    type="secondary"
    b-t="solid 1px light:$gray-14 dark:$gray-1" p="8px"
    overflow-y-auto
  >
    <!-- Kind Group -->
    <header text="default-semibold" p="x-10px t-12px b-8px">
      {{ t('home.side_panel.projects') }}
    </header>
    <main flex="~ col" gap="1px">
      <SideMenuButtonBase
        v-for="kindItem in kindMenuGroup1"
        :key="kindItem.kind"
        :active="activatedItem === `k-${kindItem.kind}`"
        tag-value="123"
        @click="updateActivatedItem(`k-${kindItem.kind}`)"
      >
        {{ kindItem.label }}
      </SideMenuButtonBase>
      <JeLine mx-10px />
      <SideMenuButtonBase
        v-for="kindItem in kindMenuGroup2"
        :key="kindItem.kind"
        :active="activatedItem === `k-${kindItem.kind}`"
        tag-value="123"
        @click="updateActivatedItem(`k-${kindItem.kind}`)"
      >
        {{ kindItem.label }}
      </SideMenuButtonBase>
    </main>

    <JeLine />

    <!-- Language Group -->
    <header text="default-semibold" p="x-10px t-12px b-8px">
      {{ t('home.side_panel.languages') }}
    </header>
    <main>
      <SideMenuButtonBase
        v-for="languageItem in languagesGroup"
        :key="languageItem.text"
        :active="activatedItem === `l-${languageItem.text}`"
        :color-value="languageItem.color"
        tag-value="123"
        @click="updateActivatedItem(`l-${languageItem.text}`)"
      >
        {{ languageItem.text }}
      </SideMenuButtonBase>
    </main>
  </JeFrame>
</template>
