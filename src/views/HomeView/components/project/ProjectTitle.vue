<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'

import { kindClass, kindLabel } from '../../utils/projectFormatters'

withDefaults(defineProps<{
  project: LocalProject
  card?: boolean
}>(), {
  card: false,
})

const { t } = useI18n()
</script>

<template>
  <div
    min-w-0 flex items-center gap-7px overflow-hidden
    :class="{ 'card-title': card }"
  >
    <strong
      v-if="card"
      min-w-0 flex-1 inline-flex items-center truncate
      text-13px font-650 light:color="$gray-1" dark:color="$gray-13"
      :title="project.group ? `${project.group}/${project.name}` : project.name"
    >
      <span
        v-if="project.isPinned" mr-4px shrink-0 text-11px color="$ui-primary"
        class="i-lucide:pin"
      />
      <span
        v-if="project.group" min-w-0 max-w="[45%]" truncate text-12px
        font-600 light:color="$gray-7" dark:color="$gray-8" :title="project.group"
      >{{ project.group }}/</span><span
        min-w-0 flex-1 truncate text-13px font-620
        light:color="$gray-1" dark:color="$gray-13" :title="project.name"
      >{{ project.name }}</span>
    </strong>
    <span
      v-else
      min-w-0 max-w-full flex items-center overflow-hidden
      class="project-title"
      :title="project.group ? `${project.group}/${project.name}` : project.name"
    >
      <span
        v-if="project.isPinned" mr-4px shrink-0 text-11px color="$ui-primary"
        class="i-lucide:pin"
      />
      <span
        v-if="project.group" min-w-0 max-w="[45%]" truncate text-12px
        font-600 light:color="$gray-7" dark:color="$gray-8" :title="project.group"
      >{{ project.group }}/</span><span
        min-w-0 flex-1 truncate text-13px font-620
        light:color="$gray-1" dark:color="$gray-13" :title="project.name"
      >{{ project.name }}</span>
    </span>
    <span
      v-if="project.kind !== ProjectKind.MINE"
      class="kind-badge"
      :class="kindClass(project.kind)"
    >
      {{ kindLabel(project.kind, t) }}
    </span>
    <span v-if="project.isRemote" class="remote-badge" :title="t('app.home.remote.badge')">
      {{ t('app.home.remote.badge') }}
    </span>
    <span v-if="project.isTemporary" class="temporary-badge" :title="t('app.home.filters.temporary')">
      {{ t('app.home.filters.temporary') }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.project-title {
  @apply flex-[0_1_auto];
}

.temporary-badge,
.remote-badge,
.kind-badge {
  @apply h-19px shrink-0 rounded-4px px-5px;
  @apply inline-flex items-center text-10px font-650 lh-12px;
}

.temporary-badge {
  @apply [color:color-mix(in_srgb,var(--yellow-2)_84%,var(--gray-1))];
  @apply [background:color-mix(in_srgb,var(--yellow-4)_18%,var(--ui-surface-background))];
}

:global(.workspace-shell.theme-dark) .temporary-badge {
  @apply [color:color-mix(in_srgb,var(--yellow-8)_88%,var(--gray-14))];
  @apply [background:color-mix(in_srgb,var(--yellow-5)_16%,var(--ui-surface-background))];
}

.remote-badge {
  @apply [color:color-mix(in_srgb,var(--teal-2)_84%,var(--gray-1))];
  @apply [background:color-mix(in_srgb,var(--teal-4)_18%,var(--ui-surface-background))];
}

:global(.workspace-shell.theme-dark) .remote-badge {
  @apply [color:color-mix(in_srgb,var(--teal-8)_88%,var(--gray-14))];
  @apply [background:color-mix(in_srgb,var(--teal-5)_16%,var(--ui-surface-background))];
}

.kind-mine {
  @apply [--kind-color:var(--blue-5)];
  @apply [--kind-bg-light-strength:13%] [--kind-bg-dark-strength:18%];
  @apply [--kind-text-light:var(--blue-5)] [--kind-text-dark:var(--blue-8)];
}

.kind-fork {
  @apply [--kind-color:var(--purple-5)];
  @apply [--kind-bg-light-strength:14%] [--kind-bg-dark-strength:20%];
  @apply [--kind-text-light:color-mix(in_srgb,var(--purple-5)_92%,var(--gray-1))];
  @apply [--kind-text-dark:color-mix(in_srgb,var(--purple-8)_86%,var(--gray-1))];
}

.kind-clone {
  @apply [--kind-color:var(--yellow-5)] [--kind-bg-dark-color:var(--yellow-3)] [--kind-bg-dark-base:var(--gray-1)];
  @apply [--kind-bg-light-strength:27%] [--kind-bg-dark-strength:30%];
  @apply [--kind-text-light:color-mix(in_srgb,var(--yellow-2)_96%,var(--gray-1))];
  @apply [--kind-text-dark:color-mix(in_srgb,var(--yellow-5)_95%,var(--gray-1))];
}

.kind-badge {
  @apply [background:color-mix(in_srgb,var(--kind-color)_var(--kind-bg-light-strength),var(--ui-surface-background))];
  @apply [color:var(--kind-text-light)];
}

:global(.workspace-shell.theme-dark) .kind-badge {
  @apply [background:color-mix(in_srgb,var(--kind-bg-dark-color,var(--kind-color))_var(--kind-bg-dark-strength),var(--kind-bg-dark-base,var(--ui-surface-background)))];
  @apply [color:var(--kind-text-dark)];
}
</style>
