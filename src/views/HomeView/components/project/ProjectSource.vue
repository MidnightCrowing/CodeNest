<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { LocalProject } from '~/constants/localProject'
import {
  hasProjectSource,
  projectSourceName,
  projectSourceUrl,
} from '~/utils/projectSource'

import {
  projectSourcePrefix,
  projectSourceTitle,
} from '../../utils/projectSource'

withDefaults(defineProps<{
  project: LocalProject
  card?: boolean
}>(), {
  card: false,
})

const emit = defineEmits<{
  open: [project: LocalProject]
}>()

const { t } = useI18n()
</script>

<template>
  <button
    v-if="projectSourceUrl(project)"
    min-w-0 w-fit max-w-full self-start border-0
    bg-transparent p-0 text-11px
    inline-flex items-center gap-4px text-left
    light:color="$gray-7" dark:color="$gray-8"
    class="project-source source-link"
    :class="card ? '-mt-4px mb-9px' : ''"
    type="button"
    :title="projectSourceTitle(project, t)"
    :aria-label="`${t('app.home.actions.open_source')}: ${projectSourceName(project)}`"
    @click.stop="emit('open', project)"
    @keydown.stop
  >
    <span shrink-0>{{ projectSourcePrefix(project, t) }}</span>
    <span min-w-0 truncate>{{ projectSourceName(project) }}</span>
    <span size-11px shrink-0 opacity-0 class="source-link-icon i-lucide:external-link" />
  </button>
  <div
    v-else-if="hasProjectSource(project)"
    min-w-0 w-fit max-w-full self-start border-0
    bg-transparent p-0 text-11px
    inline-flex items-center gap-4px text-left
    light:color="$gray-7" dark:color="$gray-8"
    class="project-source"
    :class="card ? '-mt-4px mb-9px' : ''"
    :title="projectSourceTitle(project, t)"
  >
    <span shrink-0>{{ projectSourcePrefix(project, t) }}</span>
    <span min-w-0 truncate>{{ projectSourceName(project) }}</span>
  </div>
</template>

<style lang="scss" scoped>
.source-link {
  @apply cursor-pointer hover:color-$ui-foreground focus-visible:outline-none;

  &:focus-visible {
    @apply shadow-$shadow-focus;
  }
}

.source-link-icon {
  @apply transition-opacity duration-120 ease-out;
}

.source-link:hover .source-link-icon,
.source-link:focus-visible .source-link-icon {
  @apply opacity-100;
}
</style>
