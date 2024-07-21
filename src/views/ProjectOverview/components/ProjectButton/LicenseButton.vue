<script setup lang="ts">
import type { License } from '~/constants/license'

import InfoButton from './InfoButton.vue'
import LicensePop from './LicensePop.vue'

defineProps<{
  license: License
}>()

const showPopComponent = ref(false)

function showPop() {
  showPopComponent.value = true
}

function hidePop() {
  showPopComponent.value = false
}
</script>

<template v-if="license">
  <div
    relative
    @click="showPop"
    @mouseleave="hidePop"
    @mousedown="(event: MouseEvent) => { event.stopPropagation() }"
    @mouseup="(event: MouseEvent) => { event.stopPropagation() }"
  >
    <template v-if="showPopComponent">
      <LicensePop
        :license="license"
        left="-5px"
      />
    </template>

    <InfoButton>
      <div
        m="t-1px r-5px" w="13px" h="13px"
        i-custom="license dark:license_dark"
      />
      {{ license }}
    </InfoButton>
  </div>
</template>
