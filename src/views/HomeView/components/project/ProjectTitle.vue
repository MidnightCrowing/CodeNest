<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { LocalProject } from '~/constants/localProject'
import { ProjectKind } from '~/constants/localProject'
import { kindLabel } from '~/utils/projectFormatters'

import { kindClass } from '../../utils/projectFormatters'

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
      v-if="project.kind !== ProjectKind.MINE || project.isRemote || project.isTemporary"
      class="project-tags"
      :class="{ 'card-tags': card }"
    >
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
    </span>
  </div>
</template>

<style lang="scss" scoped>
.project-title {
  @apply flex-[0_1_auto];
}

.card-title {
  @apply w-full;
}

.project-tags {
  @apply shrink-0 flex items-center gap-5px;
}

.card-tags {
  @apply ml-auto justify-end;
}

.temporary-badge,
.remote-badge,
.kind-badge {
  @apply h-18px shrink-0 rounded-4px px-5px;
  @apply inline-flex items-center text-10px font-650 lh-12px;
}

.temporary-badge {
  @apply color-$project-tag-temporary-text bg-$project-tag-temporary-bg;
}

.remote-badge {
  @apply color-$project-tag-remote-text bg-$project-tag-remote-bg;
}

.kind-mine {
  @apply color-$project-tag-mine-text bg-$project-tag-mine-bg;
}

.kind-fork {
  @apply color-$project-tag-fork-text bg-$project-tag-fork-bg;
}

.kind-clone {
  @apply color-$project-tag-clone-text bg-$project-tag-clone-bg;
}
</style>
