<script lang="ts" setup>
import { JeTransparentButton } from '@jetv/ui'

import type { LicenseEnum } from '~/constants/license'

import { showPop } from './LicensePop/LicensePopProvider'

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
    <JeTransparentButton
      class="license-button"
      flex="~ items-center" gap="5px"
      @mousedown.stop @mouseup.stop
    >
      <div
        size="13px"
        i-custom="light:license dark:license-dark"
      />
      {{ license }}
    </JeTransparentButton>
  </div>
</template>

<style lang="scss" scoped>
.license-button {
  @apply lh-16px;
  @apply px-10px py-5px;
}
</style>
