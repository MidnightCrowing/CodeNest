<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { License } from '~/constants/license'
import { LicenseInfo } from '~/constants/license'

const props = defineProps<{
  license: License
}>()

const { t } = useI18n()

const licenseInfo = LicenseInfo[props.license]
const licenseDescription = licenseInfo.description
const hasLicenseDescription = licenseInfo && 'description' in licenseInfo && licenseDescription !== null
const hasPermissions = licenseDescription && 'permissions' in licenseDescription && licenseDescription.permissions != null
const hasConditions = licenseDescription && 'conditions' in licenseDescription && licenseDescription.conditions != null
const hasLimitations = licenseDescription && 'limitations' in licenseDescription && licenseDescription.limitations != null
</script>

<template>
  <div
    absolute translate-y="-100%"
    bg="$bg-1" shadow="$shadow-1"
    p="x-20px y-5px" rounded="5px"
    cursor-default
  >
    <template v-if="hasLicenseDescription">
      <div flex="~ row items-start" gap="20px">
        <div v-if="hasPermissions">
          <h3>{{ t('license_pop.permissions') }}</h3>
          <ul>
            <li v-for="permission in licenseDescription.permissions" :key="permission">
              <span i-custom="license-permission" />
              {{ permission }}
            </li>
          </ul>
        </div>

        <div v-if="hasLimitations">
          <h3>{{ t('license_pop.limitations') }}</h3>
          <ul>
            <li v-for="limitation in licenseDescription.limitations" :key="limitation">
              <span i-custom="license-limitation" />
              {{ limitation }}
            </li>
          </ul>
        </div>

        <div v-if="hasConditions">
          <h3>{{ t('license_pop.conditions') }}</h3>
          <ul>
            <li v-for="condition in licenseDescription.conditions" :key="condition">
              <span i-custom="license-condition" />
              {{ condition }}
            </li>
          </ul>
        </div>
      </div>
    </template>

    <template v-else>
      <span whitespace-nowrap>
        {{ t('license_pop.no_description_desc') }}
      </span>
    </template>
  </div>
</template>

<style scoped lang="scss">
h3 {
  --uno: "mb-0";
}

ul {
  --uno: "mt-10px pl-0";
  --uno: "list-none whitespace-nowrap";
}
</style>
