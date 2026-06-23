<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { LicenseEnum } from '~/constants/license'
import type { LocalProject } from '~/constants/localProject'
import { formatProjectLanguage, shortLicense } from '~/utils/projectFormatters'

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
    min-w-0 max-w-full h-23px border-0 bg-transparent
    px-5px
    inline-flex items-center gap-5px truncate text-11px
    color="$ui-foreground"
    cursor-pointer underline decoration-transparent underline-offset-2
    hover:decoration-current
    type="button"
    :title="languageLabel"
    @click.stop="emit('showLanguage', project, $event)"
  >
    <span size-8px rounded-full shrink-0 :style="{ background: project.mainLangColor || '#b8b8b8' }" />
    {{ languageLabel }}
  </button>
  <span
    v-if="showLicense && project.license && project.license !== LicenseEnum.NONE"
    class="license-pill"
    min-w-0 max-w-full h-23px px-5px
    inline-flex items-center gap-5px truncate text-11px
    color="$ui-foreground"
  >
    {{ shortLicense(project.license, t) }}
  </span>
  <span
    v-else-if="showLicense"
    class="license-pill"
    min-w-0 max-w-full h-23px px-5px
    inline-flex items-center gap-5px truncate text-11px
    light:color="$gray-8" dark:color="$gray-7"
  >{{ t('app.license.none') }}</span>
</template>
