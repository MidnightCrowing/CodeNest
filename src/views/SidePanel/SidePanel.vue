<script setup lang="ts">
import { ref } from 'vue'

import KindGroup from './components/KindGroup.vue'
import LanguagesGroup from './components/LanguagesGroup.vue'
import type { ActivatedItem, GroupItem } from './types'

const activatedItem: ActivatedItem = ref('all')

function updateActivatedItem(item: GroupItem) {
  activatedItem.value = item
}
</script>

<template>
  <div
    bg="$bg-2"
    relative top="1px"
  >
    <header
      text="14px" lh="20px"
      p="x-12px t-16px b-4px"
    >
      Filter by
    </header>
    <main
      p="y-8px"
    >
      <KindGroup
        :activated-kind="activatedItem"
        :update-kind="updateActivatedItem"
      />
      <hr m="x-8px" border-0 h="1px" bg="$border">
      <LanguagesGroup
        :activated-language="activatedItem"
        :update-language="updateActivatedItem"
      />
    </main>
  </div>
</template>

<style scoped lang="scss"></style>
