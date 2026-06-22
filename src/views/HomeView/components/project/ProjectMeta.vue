<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'

import { formatProjectLanguage, shortLicense } from '../../utils/projectFormatters'

const props = withDefaults(defineProps<{
  project: LocalProject
  variant?: 'all' | 'language' | 'license'
}>(), {
  variant: 'all',
})

const emit = defineEmits<{
  showLanguage: [project: LocalProject, event: MouseEvent]
}>()

const { t } = useI18n()

const showLanguage = computed(() => props.variant !== 'license')
const showLicense = computed(() => props.variant !== 'language')
const languageLabel = computed(() => formatProjectLanguage(props.project.mainLang, t))
</script>

<template>
  <button
    v-if="showLanguage"
    class="inline-pill"
    min-w-0 max-w-full h-23px rounded-4px px-7px
    border-0
    inline-flex items-center gap-5px truncate text-11px
    bg="$ui-control-background" color="$ui-foreground"
    cursor-pointer hover:bg="$ui-hover-background"
    type="button"
    :title="languageLabel"
    @click.stop="emit('showLanguage', project, $event)"
  >
    <span size-8px rounded-full shrink-0 :style="{ background: project.mainLangColor || '#b8b8b8' }" />
    {{ languageLabel }}
  </button>
  <span
    v-if="showLicense && project.license && project.license !== LicenseEnum.NONE"
    class="license-cell"
    min-w-0 max-w-full h-23px rounded-4px px-7px
    border-0
    inline-flex items-center gap-5px truncate text-11px
    bg="$ui-control-background" color="$ui-foreground"
  >
    {{ shortLicense(project.license, t) }}
  </span>
  <span
    v-else-if="showLicense"
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
