<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div
    h-full flex flex-col items-center justify-center
    gap-5px light:color="$gray-6" dark:color="$gray-8"
  >
    <strong text-14px light:color="$gray-2" dark:color="$gray-12">{{ t('app.home.empty.title') }}</strong>
    <span>{{ t('app.home.empty.desc') }}</span>
  </div>
</template>
