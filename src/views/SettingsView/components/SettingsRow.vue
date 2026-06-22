<script lang="ts" setup>
withDefaults(defineProps<{
  title: string
  description?: string
  align?: 'center' | 'start'
  descriptionTone?: 'muted' | 'danger'
  status?: string
  statusTone?: 'neutral' | 'info' | 'success' | 'warning' | 'error'
  reserveStatus?: boolean
}>(), {
  description: '',
  align: 'center',
  descriptionTone: 'muted',
  status: '',
  statusTone: 'neutral',
  reserveStatus: false,
})
</script>

<template>
  <div
    class="setting-row"
    min-h-42px min-w-0 flex items-center justify-between
    gap-14px
    :class="{ 'align-start': align === 'start' }"
  >
    <div min-w-0 flex-1 flex flex-col gap-3px>
      <strong text-13px font-620>{{ title }}</strong>
      <span v-if="description" text-12px light:color="$gray-6" dark:color="$gray-8" :class="descriptionTone">
        {{ description }}
      </span>
    </div>

    <div
      class="setting-content" min-w-0 max-w-full flex flex-col
      items-end gap-6px
    >
      <slot />
      <p
        v-if="reserveStatus || status || $slots.status"
        class="setting-status"
        m-0 min-h-16px max-w-520px text-right text-12px
        lh-16px
        :class="[statusTone, { empty: !status && !$slots.status }]"
        :aria-hidden="!status && !$slots.status"
      >
        <slot name="status">
          {{ status }}
        </slot>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.setting-row.align-start {
  @apply items-start;

  .setting-content {
    @apply items-stretch;
  }
}

strong,
span {
  overflow-wrap: anywhere;
}

span.danger {
  @apply color-$red-5;
}

.setting-status {
  overflow-wrap: anywhere;

  &.empty {
    visibility: hidden;
  }

  &.neutral {
    @apply color-$ui-muted-foreground;
  }

  &.info {
    @apply color-$ui-muted-foreground;
  }

  &.success {
    color: color-mix(in srgb, var(--green-5) 90%, var(--ui-foreground));
  }

  &.warning {
    color: color-mix(in srgb, var(--yellow-4) 90%, var(--ui-foreground));
  }

  &.error {
    color: color-mix(in srgb, var(--red-5) 92%, var(--ui-foreground));
  }
}

:global(.dark) .setting-status.success {
  color: color-mix(in srgb, var(--green-7) 86%, var(--gray-14));
}

:global(.dark) .setting-status.warning {
  color: color-mix(in srgb, var(--yellow-7) 86%, var(--gray-14));
}

:global(.dark) .setting-status.error {
  color: color-mix(in srgb, var(--red-7) 86%, var(--gray-14));
}

@media (max-width: 720px) {
  .setting-row {
    @apply flex-col items-stretch gap-8px;
  }

  .setting-content {
    @apply items-stretch;
  }

  .setting-status {
    @apply max-w-full text-left;
  }
}
</style>
