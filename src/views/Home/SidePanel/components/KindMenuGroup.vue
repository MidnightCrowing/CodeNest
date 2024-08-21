<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import Hr from '~/components/common/Hr.vue'

import { KindMenuList } from '../constants'
import type { KindMenuItem } from '../types'
import KindButton from './KindMenuButton.vue'

const { t } = useI18n()

const kindMenuGroup1: KindMenuItem[] = [
  { kind: KindMenuList.ALL, i18nKey: t('home.side_panel.kinds.all') },
  { kind: KindMenuList.MINE, i18nKey: t('home.side_panel.kinds.mine') },
  { kind: KindMenuList.FORK, i18nKey: t('home.side_panel.kinds.fork') },
  { kind: KindMenuList.CLONE, i18nKey: t('home.side_panel.kinds.clone') },
]
const kindMenuGroup2: KindMenuItem[] = [
  { kind: KindMenuList.TEST, i18nKey: t('home.side_panel.kinds.test') },
]
</script>

<template>
  <header
    head-1-thin text-comment
    p="x-16px t-16px b-4px"
  >
    {{ t('home.side_panel.projects') }}
  </header>
  <main>
    <KindButton
      v-for="kindItem in kindMenuGroup1"
      :key="kindItem.kind"
      :kind-item="kindItem"
    />
    <Hr />
    <KindButton
      v-for="kindItem in kindMenuGroup2"
      :key="kindItem.kind"
      :kind-item="kindItem"
    />
  </main>
</template>
