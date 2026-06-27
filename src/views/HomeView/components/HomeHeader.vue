<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

defineProps<{
  total: number
  syncing: boolean
  scannerEnabled: boolean
}>()

const emit = defineEmits<{
  add: []
  sync: []
  settings: []
}>()

const { t } = useI18n()
</script>

<template>
  <section
    shrink-0 flex items-center justify-between gap-12px
    px-14px pt-10px pb-7px
    class="workspace-topbar"
  >
    <div min-w-0 shrink-0 flex flex-col gap-1px>
      <div min-w-0 flex items-center gap-6px>
        <h1
          m-0 inline-flex items-center gap-7px text-17px
          font-600 lh-21px
        >
          {{ t('app.home.title') }}
          <span
            shrink-0 size-18px rounded-full px-0
            inline-flex items-center justify-center
            text-11px font-600 bg="$ui-hover-background" color="$ui-muted-foreground"
          >{{ total }}</span>
        </h1>
        <button
          size-26px rounded-5px border-0 bg-transparent p-0
          inline-flex items-center justify-center
          color="$ui-foreground" hover:bg="$ui-hover-background"
          transition duration-120 ease-out
          type="button"
          :title="t('app.settings.title')"
          :aria-label="t('app.settings.title')"
          @click="emit('settings')"
        >
          <span i-lucide:settings size-14px />
        </button>
      </div>
    </div>

    <div shrink-0 flex items-center gap-7px class="topbar-actions">
      <button
        v-if="scannerEnabled"
        h-28px shrink-0 max-w-full rounded-5px border-0
        px-9px
        inline-flex items-center justify-center gap-5px whitespace-nowrap
        text-12px font-500
        bg="$ui-surface-background" color="$ui-foreground"
        hover:bg="$ui-hover-background" disabled:opacity-55 disabled:hover:bg="$ui-surface-background"
        transition duration-120 ease-out
        class="topbar-button"
        type="button"
        :disabled="syncing"
        @click="emit('sync')"
      >
        <span i-lucide:refresh-cw size-14px :class="{ 'animate-spin': syncing }" />
        {{ syncing ? t('app.home.syncing') : t('app.home.sync') }}
      </button>
      <button
        h-28px shrink-0 max-w-full rounded-5px border-0
        px-9px
        inline-flex items-center justify-center gap-5px whitespace-nowrap
        text-12px font-500
        bg="$ui-primary" color="$ui-primary-foreground"
        hover:bg="$ui-primary-hover" active:bg="$ui-primary-active" disabled:opacity-55
        transition duration-120 ease-out
        class="topbar-button"
        type="button"
        @click="emit('add')"
      >
        <span i-lucide:plus size-14px color="$ui-primary-foreground" />
        {{ t('app.home.add_project') }}
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@media (max-width: 760px) {
  .workspace-topbar {
    @apply items-start;
  }

  .topbar-actions {
    @apply flex-wrap justify-end;
  }
}

@media (max-width: 560px) {
  .workspace-topbar {
    @apply gap-8px px-10px pt-8px pb-6px;
  }

  .topbar-actions {
    @apply gap-5px;
  }

  .topbar-button {
    @apply px-7px;
  }
}
</style>
