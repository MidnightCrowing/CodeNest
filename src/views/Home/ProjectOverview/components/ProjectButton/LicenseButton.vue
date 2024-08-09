<script setup lang="ts">
import { hidePop, showPop } from '~/components/LicensePop/licensePopProvider'
import type { License } from '~/constants/license'

import InfoButton from './InfoButton.vue'

defineProps<{
  license: License
}>()

function handleClick(event: MouseEvent, license: License) {
  const target = event.target as HTMLElement
  const rect = target.getBoundingClientRect()

  const top = rect.top + window.scrollY - 3
  const left = rect.left + window.scrollX - 5

  showPop(license, top, left)
}
</script>

<template v-if="license">
  <div
    relative
    @click="handleClick($event, license)"
    @mouseleave="hidePop"
    @mousedown="(event: MouseEvent) => { event.stopPropagation() }"
    @mouseup="(event: MouseEvent) => { event.stopPropagation() }"
  >
    <InfoButton>
      <div
        m="t-1px r-5px" w="13px" h="13px"
        i-mode="license?mask"
      />
      {{ license }}
    </InfoButton>
  </div>
</template>
