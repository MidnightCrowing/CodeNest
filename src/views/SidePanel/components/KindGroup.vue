<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import KindButton from '~/components/KindButton.vue'

import type { KindItem } from '../types'
import { Kind } from '../types'

const { t } = useI18n()

const kindGroup1: KindItem[] = [
  { kind: Kind.all, i18nKey: t('side_panel.kinds.all') },
  { kind: Kind.mine, i18nKey: t('side_panel.kinds.mine') },
  { kind: Kind.fork, i18nKey: t('side_panel.kinds.fork') },
  { kind: Kind.clone, i18nKey: t('side_panel.kinds.clone') },
]
const kindGroup2: KindItem[] = [
  { kind: Kind.test, i18nKey: t('side_panel.kinds.test') },
]
</script>

<template>
  <header
    text="14px" lh="20px"
    color="$text-color-3"
    p="x-16px t-16px b-4px"
  >
    {{ t('side_panel.project') }}
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
