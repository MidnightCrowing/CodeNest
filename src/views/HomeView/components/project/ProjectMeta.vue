<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'

import { shortLicense } from '../../utils/projectFormatters'

defineProps<{
  project: LocalProject
}>()

const emit = defineEmits<{
  showLanguage: [project: LocalProject, event: MouseEvent]
}>()

const { t } = useI18n()
</script>

<template>
  <button
    class="inline-pill"
    min-w-0 max-w-full h-23px rounded-4px px-7px
    border-0
    inline-flex items-center gap-5px truncate text-11px
    bg="$ui-control-background" color="$ui-foreground"
    cursor-pointer hover:bg="$ui-hover-background"
    type="button"
    :title="project.mainLang || t('app.common.unknown')"
    @click.stop="emit('showLanguage', project, $event)"
  >
    <span size-8px rounded-full shrink-0 :style="{ background: project.mainLangColor || '#b8b8b8' }" />
    {{ project.mainLang || t('app.common.unknown') }}
  </button>
  <span
    v-if="project.license && project.license !== LicenseEnum.NONE"
    class="license-cell"
    min-w-0 max-w-full h-23px rounded-4px px-7px
    border-0
    inline-flex items-center gap-5px truncate text-11px
    bg="$ui-control-background" color="$ui-foreground"
  >
    {{ shortLicense(project.license, t) }}
  </span>
  <span
    v-else
    class="license-cell muted"
    min-w-0 max-w-full h-23px rounded-4px px-7px
    border-0
    inline-flex items-center gap-5px truncate text-11px
    bg="$ui-control-background"
  >{{ t('app.license.none') }}</span>
</template>

<style lang="scss" scoped>
.license-cell.muted {
  @apply light:color-$gray-8 dark:color-$gray-7;
}
</style>
