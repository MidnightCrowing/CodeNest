<script setup lang="ts">
import type { License } from '~/constants/license'

import InfoButton from './InfoButton.vue'

defineProps<{
  license: License
}>()

// eslint-disable-next-line unused-imports/no-unused-vars
function licenseButtonHover(license: License) {
}

function licenseButtonHovered() {
}
</script>

<template v-if="license">
  <InfoButton
    @mouseenter="licenseButtonHover(license)"
    @mouseleave="licenseButtonHovered"
  >
    <div
      m="t-1px r-5px" w="13px" h="13px"
      i-custom="license dark:license_dark"
    />
    {{ license }}
  </InfoButton>
</template>
