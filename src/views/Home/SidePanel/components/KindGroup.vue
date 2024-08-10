<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { Kind } from '../constants'
import type { KindItem } from '../types'
import KindButton from './KindButton.vue'

const { t } = useI18n()

const kindGroup1: KindItem[] = [
  { kind: Kind.ALL, i18nKey: t('home.side_panel.kinds.all') },
  { kind: Kind.MINE, i18nKey: t('home.side_panel.kinds.mine') },
  { kind: Kind.FORK, i18nKey: t('home.side_panel.kinds.fork') },
  { kind: Kind.CLONE, i18nKey: t('home.side_panel.kinds.clone') },
]
const kindGroup2: KindItem[] = [
  { kind: Kind.TEST, i18nKey: t('home.side_panel.kinds.test') },
]
</script>

<template>
  <header
    head-1-thin
    color="$text-color-3"
    p="x-16px t-16px b-4px"
  >
    {{ t('home.side_panel.projects') }}
  </header>
  <main>
    <KindButton
      v-for="kindItem in kindGroup1"
      :key="kindItem.kind"
      :kind-item="kindItem"
    />
    <hr hr m="x-16px">
    <KindButton
      v-for="kindItem in kindGroup2"
      :key="kindItem.kind"
      :kind-item="kindItem"
    />
  </main>
</template>
