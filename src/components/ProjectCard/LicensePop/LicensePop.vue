<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

import { LicenseInfo } from '~/constants/license'
import { JeLink, JeTooltip } from '~/jetv-ui'
import { openLink } from '~/utils/main'

import { license, popupVisible, position } from './licensePopProvider'

const { t } = useI18n()

const popupRef = ref<HTMLElement | null>(null)

const licenseInfo = computed(() => LicenseInfo[license.value])
const licenseDescription = computed(() => licenseInfo.value?.description)

onClickOutside(popupRef, () => {
  popupVisible.value = false
})
</script>

<template>
  <JeTooltip
    v-if="popupVisible && license"
    ref="popupRef"
    class="licensePop" state="info" direction="down"
    :style="{ top: `${position.top}px`, left: `${position.left}px` }"
  >
    <template v-if="licenseDescription">
      <div flex="~ row items-start" gap="20px">
        <div v-if="licenseDescription?.permissions">
          <span text="h2">
            {{ t('license_pop.permissions') }}
          </span>
          <ul
            pl-0
            list-none whitespace-nowrap
          >
            <li
              v-for="permission in licenseDescription.permissions" :key="permission"
              flex="~ items-center" gap="5px"
            >
              <span size="0.9rem" i-custom="license-permission" />
              {{ permission }}
            </li>
          </ul>
        </div>

        <div v-if="licenseDescription?.limitations">
          <span text="h2">
            {{ t('license_pop.limitations') }}
          </span>
          <ul
            pl-0
            list-none whitespace-nowrap
          >
            <li
              v-for="limitation in licenseDescription.limitations" :key="limitation"
              flex="~ items-center" gap="5px"
            >
              <span size="0.9rem" i-custom="license-limitation" />
              {{ limitation }}
            </li>
          </ul>
        </div>

        <div v-if="licenseDescription?.conditions">
          <span text="h2">
            {{ t('license_pop.conditions') }}
          </span>
          <ul
            pl-0
            list-none whitespace-nowrap
          >
            <li
              v-for="condition in licenseDescription.conditions" :key="condition"
              flex="~ items-center" gap="5px"
            >
              <span size="0.9rem" i-custom="license-condition" />
              {{ condition }}
            </li>
          </ul>
        </div>
      </div>

      <JeLink
        type="web"
        :action="{ onClick: () => { openLink(licenseDescription?.fromUrl) } }"
      >
        {{ t('license_pop.description_from') }}
      </JeLink>
    </template>

    <template v-else>
      <span whitespace-nowrap>
        {{ t('license_pop.no_description_desc') }}
      </span>
    </template>
  </JeTooltip>
</template>

<style scoped lang="scss">
.licensePop {
  @apply absolute translate-y--100%;
  @apply px-15px pt-10px pb-5px rounded-5px;
  @apply min-h-20px;
}
</style>
