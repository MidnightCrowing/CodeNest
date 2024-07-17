<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import LanguageButton from '~/components/LanguageButton.vue'

import type { LanguageItem } from '../types'

const { t } = useI18n()

const languageGroup: LanguageItem[] = [
  { language: 'JavaScript', color: '#f1e05a' },
  { language: 'HTML', color: '#e34c26' },
  { language: 'Java', color: '#b07219' },
  { language: 'Python', color: '#3572a5' },
  { language: 'TypeScript', color: '#3178c6' },
  { language: 'Jupyter Notebook', color: '#da5b0b' },
  { language: 'C#', color: '#178600' },
  { language: 'CSS', color: '#563d7c' },
  { language: 'Ruby', color: '#701516' },
  { language: 'C++', color: '#f34b7d' },
]
</script>

<template>
  <header
    text="12px" lh="18px"
    color="$text-color-3"
    p="x-16px y-6px"
  >
    {{ t('side_panel.languages') }}
  </header>
  <main>
    <LanguageButton
      v-for="languageItem in languageGroup"
      :key="languageItem.language"
      :language-item="languageItem"
    />
  </main>
</template>
