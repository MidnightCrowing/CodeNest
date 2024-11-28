<script lang="ts" setup>
import type { JeSwitchProps } from './types'

const props = withDefaults(defineProps<JeSwitchProps>(), {
  modelValue: false,
  onLabel: null,
  offLabel: null,
  disabled: false,
})
const emit = defineEmits(['update:modelValue'])

const isOn = ref(props.modelValue)

// 监听 `modelValue` 的变化，确保外部绑定的值保持一致
watch(() => props.modelValue, (newVal) => {
  isOn.value = newVal
})

// 切换开关状态
function toggleSwitch() {
  if (props.disabled)
    return // 禁用状态下不能切换

  isOn.value = !isOn.value
  emit('update:modelValue', isOn.value)
}
</script>

<template>
  <div
    class="je-switch"
    :class="{ 'je-switch--disabled': disabled }"
  >
    <slot />

    <div
      class="je-switch__inner"
      :tabindex="disabled ? -1 : 0"
      @click="toggleSwitch"
    >
      <div
        class="je-switch__toggle"
        :class="`je-switch__toggle--${isOn ? 'on' : 'off'}`"
      />

      <!-- Value Label -->
      <span
        v-if="onLabel || offLabel"
        class="je-switch__value-label"
      >
        {{ isOn ? onLabel : offLabel }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@mixin enabled-switch {
  .je-switch:not(.je-switch--disabled) & {
    @content;
  }
}

@mixin disabled-switch {
  .je-switch.je-switch--disabled & {
    @content;
  }
}

.je-switch {
  @apply font-sans text-13px lh-25px;
  @apply flex items-center gap-5px;
  @apply cursor-default;
}

.je-switch__inner {
  @apply flex items-center gap-5px;
  @apply cursor-pointer;

  @include disabled-switch {
    @apply cursor-not-allowed;
  }
}

.je-switch__toggle {
  @apply relative;
  @apply w-10 h-5;
  @apply b-solid b-2px rounded-full;
  @apply transition-all;

  &::before {
    @apply content-[''];
    @apply absolute top-1/2 left-1;
    @apply w-0.75rem h-0.75rem rounded-full;
    @apply transform -translate-y-1/2 transition-all;
  }

  // On 状态样式
  &--on {
    @apply before:left-24px;

    @include enabled-switch {
      // light
      @apply light:b-$blue-4 light:hover:b-$blue-3 light:active:b-$blue-2 light:focus:bg-$blue-4;
      @apply light:bg-$blue-4 light:hover:bg-$blue-3 light:active:bg-$blue-2 light:focus:bg-$blue-4;
      @apply light:before:bg-$gray-14;

      // dark
      @apply dark:b-$blue-6 dark:hover:b-$blue-5 dark:active:b-$blue-4 dark:focus:bg-$blue-6;
      @apply dark:bg-$blue-6 dark:hover:bg-$blue-5 dark:active:bg-$blue-4 dark:focus:bg-$blue-6;
      @apply dark:before:bg-$gray-1;
    }

    @include disabled-switch {
      // light
      @apply light:b-$gray-12 light:bg-$gray-12;
      @apply light:before:bg-$gray-14;

      // dark
      @apply dark:b-$gray-5 dark:bg-$gray-5;
      @apply dark:before:bg-$gray-1;
    }
  }

  // Off 状态样式
  &--off {
    @apply before:left-4px;

    @include enabled-switch {
      // light
      @apply light:b-$gray-9 light:hover:b-$gray-8 light:active:b-$gray-7 light:focus:b-$blue-4;
      @apply light:bg-$gray-14 light:active:bg-$gray-13;
      @apply light:before:bg-$gray-8;

      // dark
      @apply dark:b-$gray-5 dark:hover:b-$gray-7 dark:active:b-$gray-7 dark:focus:b-$blue-6;
      @apply dark:bg-$gray-1 dark:active:bg-$gray-2 dark:focus:bg-$gray-2;
      @apply dark:before:bg-$gray-7;
    }

    @include disabled-switch {
      // light
      @apply light:b-$gray-12 light:bg-$gray-14;
      @apply light:before:bg-$gray-12;

      // dark
      @apply dark:b-$gray-5 dark:bg-$gray-1;
      @apply dark:before:bg-$gray-5;
    }
  }
}

.je-switch__value-label {
  @apply text-0.8rem;

  @include enabled-switch {
    @apply light:color-$gray-1 dark:color-$gray-12;
  }

  @include disabled-switch {
    @apply color-$gray-8;
  }
}
</style>
