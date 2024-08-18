<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { LicenseInfo } from '~/constants/license'

import { license, position, visible as visibleSign } from './licensePopProvider'

const { t } = useI18n()

const popElementRef = ref<HTMLElement | null>(null)
const popVisible = ref(false)

const licenseInfo = computed(() => LicenseInfo[license.value])
const licenseDescription = computed(() => licenseInfo.value?.description)
const hasLicenseDescription = computed(() => !!licenseInfo.value?.description)
const hasPermissions = computed(() => !!licenseDescription.value?.permissions)
const hasConditions = computed(() => !!licenseDescription.value?.conditions)
const hasLimitations = computed(() => !!licenseDescription.value?.limitations)

function handleMouseEnter() {
  popVisible.value = true
}

function handleMouseLeave() {
  setTimeout(() => {
    if (!popElementRef.value?.matches(':hover')) {
      popVisible.value = false
    }
  }, 100)
}

watch(visibleSign, (newVal: boolean) => {
  if (!newVal) {
    setTimeout(() => {
      if (!popElementRef.value?.matches(':hover')) {
        popVisible.value = false
      }
    }, 100)
  }
  else {
    popVisible.value = true
  }
})
</script>

<template>
  <div
    v-if="popVisible"
    ref="popElementRef"
    absolute
    translate-y="-100%"
    bg="theme-panel-bgDialog" shadow="$shadow-1"
    p="x-20px y-5px" rounded="5px"
    cursor-default
    :style="{ top: `${position.top}px`, left: `${position.left}px` }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <template v-if="hasLicenseDescription">
      <div flex="~ row items-start" gap="20px">
        <div v-if="hasPermissions">
          <h3 mb-0>
            {{ t('license_pop.permissions') }}
          </h3>
          <ul
            m="t-10px" pl-0
            list-none whitespace-nowrap
          >
            <li v-for="permission in licenseDescription.permissions" :key="permission">
              <span size="1rem" i-static="license-permission" />
              {{ permission }}
            </li>
          </ul>
        </div>

        <div v-if="hasLimitations">
          <h3 mb-0>
            {{ t('license_pop.limitations') }}
          </h3>
          <ul
            m="t-10px" pl-0
            list-none whitespace-nowrap
          >
            <li v-for="limitation in licenseDescription.limitations" :key="limitation">
              <span size="1rem" i-static="license-limitation" />
              {{ limitation }}
            </li>
          </ul>
        </div>

        <div v-if="hasConditions">
          <h3 mb-0>
            {{ t('license_pop.conditions') }}
          </h3>
          <ul
            m="t-10px" pl-0
            list-none whitespace-nowrap
          >
            <li v-for="condition in licenseDescription.conditions" :key="condition">
              <span size="1rem" i-static="license-condition" />
              {{ condition }}
            </li>
          </ul>
        </div>
      </div>

      <div m="b-10px">
        <a
          relative text-link
          :href="licenseDescription.fromUrl"
          target="_blank"
        >
          {{ t('license_pop.description_from') }}
          <span
            i-static="external-link-arrow?mask"
            w="13px" h="13px"
            absolute top="2px"
          />
        </a>
      </div>
    </template>

    <template v-else>
      <span whitespace-nowrap>
        {{ t('license_pop.no_description_desc') }}
      </span>
    </template>
  </div>
</template>
