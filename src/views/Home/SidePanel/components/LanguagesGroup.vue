<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { ProjectLanguageInfo } from '~/constants/types'

import LanguageButton from './LanguageButton.vue'

const { t } = useI18n()

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
  <header
    head-2-thin
    color="$text-color-3"
    p="x-16px y-6px"
  >
    {{ t('side_panel.languages') }}
  </header>
  <main>
    <LanguageButton
      v-for="languageItem in languagesGroup"
      :key="languageItem.text"
      :language-item="languageItem"
    />
  </main>
</template>
