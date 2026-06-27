<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import UiSegmentedControl from '~/components/ui/UiSegmentedControl.vue'
import UiSelect from '~/components/ui/UiSelect.vue'

import type { LayoutMode } from '../types'
import LanguageFilterSelect from './LanguageFilterSelect.vue'

type FilterValue = string

interface FilterOption<T extends string = string> {
  value: T
  label: string
  color?: string
  count?: number
}

defineProps<{
  searchValue: string
  kindFilter: FilterValue
  statusFilter: FilterValue
  languageFilter: FilterValue
  sortKey: FilterValue
  layoutMode: LayoutMode
  kindOptions: FilterOption[]
  statusOptions: FilterOption[]
  languageOptions: FilterOption[]
  sortOptions: FilterOption[]
  layoutOptions: Array<{ value: LayoutMode, label: string, icon: string }>
  activeFilterCount: number
}>()

const emit = defineEmits<{
  'update:searchValue': [value: string]
  'update:kindFilter': [value: string]
  'update:statusFilter': [value: string]
  'update:languageFilter': [value: string]
  'update:sortKey': [value: string]
  'update:layoutMode': [value: LayoutMode]
  clearSearch: []
  clearFilters: []
}>()

const { t } = useI18n()
</script>

<template>
  <section
    shrink-0 flex flex-wrap items-center gap-7px
    px-14px pb-7px
    class="filter-bar"
  >
    <div
      h-30px min-w-220px flex-1 rounded-md border
      flex items-center gap-7px px-9px
      bg="$ui-control-background" color="$ui-foreground"
      class="search-box"
    >
      <span i-lucide:search shrink-0 />
      <input
        min-w-0 flex-1 appearance-none border-0 border-solid
        bg-transparent outline-none
        text-12px color="$ui-foreground" placeholder:color="$ui-muted-foreground"
        :value="searchValue"
        :aria-label="t('app.home.search_placeholder')"
        :placeholder="t('app.home.search_placeholder')"
        spellcheck="false"
        @input="emit('update:searchValue', ($event.target as HTMLInputElement).value)"
      >
      <button
        v-if="searchValue"
        size-18px shrink-0 rounded-full border-0 p-0
        inline-flex items-center justify-center cursor-pointer text-11px
        bg="$ui-hover-background" color="$ui-muted-foreground" hover:color="$ui-foreground"
        type="button"
        :title="t('app.common.clear')"
        :aria-label="t('app.common.clear')"
        @click="emit('clearSearch')"
      >
        <span i-lucide:x />
      </button>
    </div>

    <UiSelect
      :model-value="kindFilter"
      :options="kindOptions"
      :placeholder="t('app.home.filters.kind')"
      :aria-label="t('app.home.filters.kind')"
      min-width="128px"
      @update:model-value="emit('update:kindFilter', $event)"
    />

    <UiSelect
      :model-value="statusFilter"
      :options="statusOptions"
      :placeholder="t('app.home.filters.status')"
      :aria-label="t('app.home.filters.status')"
      min-width="128px"
      @update:model-value="emit('update:statusFilter', $event)"
    />

    <LanguageFilterSelect
      :model-value="languageFilter"
      :options="languageOptions"
      :placeholder="t('app.home.filters.language')"
      :aria-label="t('app.home.filters.language')"
      min-width="150px"
      content-width="210px"
      @update:model-value="emit('update:languageFilter', $event)"
    />

    <UiSelect
      :model-value="sortKey"
      :options="sortOptions"
      :placeholder="t('app.home.filters.sort')"
      :aria-label="t('app.home.filters.sort')"
      min-width="122px"
      content-width="170px"
      @update:model-value="emit('update:sortKey', $event)"
    />

    <button
      v-if="activeFilterCount"
      h-30px border-0 rounded-5px px-9px
      inline-flex items-center gap-6px whitespace-nowrap
      text-12px font-500 cursor-pointer
      bg="$ui-control-background" color="$ui-muted-foreground"
      hover:bg="$ui-hover-background" hover:color="$ui-foreground"
      class="clear-button"
      type="button"
      @click="emit('clearFilters')"
    >
      {{ t('app.home.clear_count', { count: activeFilterCount }) }}
    </button>

    <UiSegmentedControl
      class="layout-switch"
      :model-value="layoutMode"
      :options="layoutOptions"
      :aria-label="t('app.home.layout.label')"
      @update:model-value="emit('update:layoutMode', $event as LayoutMode)"
    />
  </section>
</template>

<style lang="scss" scoped>
.search-box {
  @apply border-$ui-input border-solid shadow-$shadow-control;
  @apply transition duration-120 ease-out;

  &:focus-within {
    @apply border-$ui-ring shadow-$shadow-focus;
  }
}

@media (max-width: 760px) {
  .search-box {
    @apply flex-none w-220px min-w-220px;
  }

  .layout-switch {
    @apply flex-none justify-center;
  }

  .clear-button {
    @apply shrink-0;
  }
}

@media (max-width: 560px) {
  .filter-bar {
    @apply px-10px gap-5px;
  }

  .search-box {
    @apply w-188px min-w-188px;
  }

  .clear-button {
    @apply px-7px;
  }
}
</style>
