<script lang="ts" setup>
import type { LicenseEnum } from '~/constants/license'

import InfoButton from './InfoButton.vue'
import { showPop } from './LicensePop/licensePopProvider'

defineProps<{
  license: LicenseEnum
}>()

const containerRef = ref<HTMLElement | null>(null)

function handleClick(license: LicenseEnum) {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()

    const top = rect.top + window.scrollY - 3
    const left = rect.left + window.scrollX - 5

    showPop(license, top, left)
  }
}
</script>

<template v-if="license">
  <div ref="containerRef" @click="handleClick(license)">
    <InfoButton flex="~ items-center" gap="5px">
      <div
        size="13px"
        i-custom="light:license dark:license-dark"
      />
      {{ license }}
    </InfoButton>
  </div>
</template>
