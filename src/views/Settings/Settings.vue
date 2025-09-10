<script lang="ts" setup>
import { JeButton, JeFrame, JeSearchField, JeTransparentButton } from 'jetv-ui'
import { useI18n } from 'vue-i18n'

import { SettingPageEnum, ViewEnum } from '~/constants/appEnums'
import { useSettingsStore } from '~/stores/settingsStore'

import { activatedPage } from './SettingsProvider'

defineOptions({
  name: 'Settings',
})

const settings = useSettingsStore()
const { t } = useI18n()

// ==================== Side Menu ====================
const menuItems: ComputedRef<{ value: SettingPageEnum, label: string }[]> = computed(() => [
  { value: SettingPageEnum.Appearance, label: t('settings.appearance.title') },
  { value: SettingPageEnum.Ides, label: t('settings.ides_path.title') },
  { value: SettingPageEnum.AutoScan, label: t('settings.auto_scan.title') },
  { value: SettingPageEnum.About, label: t('settings.about.title') },
])

const PageComponents: Record<SettingPageEnum, Component> = {
  [SettingPageEnum.Appearance]: defineAsyncComponent(() => import('./pages/Appearance.vue')),
  [SettingPageEnum.Ides]: defineAsyncComponent(() => import('./pages/Ides.vue')),
  [SettingPageEnum.AutoScan]: defineAsyncComponent(() => import('./pages/AutoProjectScanner.vue')),
  [SettingPageEnum.About]: defineAsyncComponent(() => import('./pages/About.vue')),
}

function updateActivatedPage(page: SettingPageEnum) {
  activatedPage.value = page
}

const searchValue = ref<string>('')

// ==================== Bottom Menu ====================
const activatedView = inject('activatedView') as Ref<ViewEnum>

function openSettingsJSON() {
  window.api.openSettingsJSON()
}

function saveAllSettings() {
  settings.saveSettings()
  changeHomeView()
}

function cancelChanges() {
  // Reset unsaved changes
  settings.loadSettings()
  changeHomeView()
}

function changeHomeView() {
  if (activatedView) {
    activatedView.value = ViewEnum.Home
  }
}

onMounted(async () => {
  await settings.loadSettings()
})

onUnmounted(() => {
  activatedPage.value = SettingPageEnum.Appearance
})
</script>

<template>
  <JeFrame
    type="secondary"
    flex="~ col justify-between"
    overflow-hidden
  >
    <div
      grow flex="~ row" gap="5px"
      overflow-hidden
    >
      <JeFrame
        type="secondary"
        shrink-0 flex="~ col" w-200px
        overflow-y-auto
      >
        <JeSearchField v-model="searchValue" class="search-input" />

        <!-- Menu -->
        <div flex="~ col">
          <div
            v-for="item in menuItems"
            :key="item.value"
            class="menu-item"
            :class="{ active: activatedPage === item.value }"
            :tabindex="0"
            b="solid x-0 y-2px transparent" p="x-20px y-6px"
            focus-visible:b="light:$blue-4 dark:$blue-6" focus-visible:outline-0
            @click="updateActivatedPage(item.value)"
            @keydown.enter="updateActivatedPage(item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </JeFrame>

      <JeFrame type="secondary" grow overflow-auto>
        <Transition name="page-fade">
          <Component :is="PageComponents[activatedPage]" />
        </Transition>
      </JeFrame>
    </div>

    <JeFrame
      type="secondary"
      b-t="solid 2px light:$gray-12 dark:$gray-3" p="8px"
      flex="~ row justify-between" gap="8px"
    >
      <JeTransparentButton
        flex="~ items-center" gap="5px"
        w="200px"
        @click="openSettingsJSON"
      >
        <span i-jet="light:inlay-settings dark:inlay-settings-dark" />
        {{ t('settings.open_json_file') }}
      </JeTransparentButton>

      <div flex="~ row-reverse justify-between" gap="8px">
        <JeButton
          order-2
          @click="saveAllSettings"
        >
          {{ t('settings.save') }}
        </JeButton>
        <JeButton
          class="cancel-button" type="secondary-alt"
          order-1
          @click="cancelChanges"
        >
          {{ t('settings.cancel') }}
        </JeButton>
      </div>
    </JeFrame>
  </JeFrame>
</template>

<style lang="scss" scoped>
.search-input {
  @apply m-10px;
}

.menu-item.active {
  @apply light:bg-$blue-11 dark:bg-$blue-2;
}
</style>
