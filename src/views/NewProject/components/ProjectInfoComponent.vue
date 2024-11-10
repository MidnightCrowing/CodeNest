<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { JeFileInputField, JeInputField } from '~/jetv-ui'

import ConfigItem from './common/ConfigItem.vue'
import ConfigItemTitle from './common/ConfigItemTitle.vue'

const { t } = useI18n()

const pathInputValue = ref('')
const nameInputValue = ref('')
const repositoryFolderName = ref('')
const pathInputErrorValue = ref(true)
const nameInputErrorValue = ref(true)

watch(pathInputValue, (newValue) => {
  // 提取路径的最后一个文件夹名称
  const parts = newValue.split(/[\\/]/)
  repositoryFolderName.value = parts[parts.length - 1] || ''
})

function fillProjectName() {
  nameInputValue.value = repositoryFolderName.value
  nameInputErrorValue.value = false
}
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.directory" />
    <JeFileInputField v-model="pathInputValue" :validated="pathInputErrorValue" grow />
    <ConfigItemTitle title="new_project.name" />
    <JeInputField v-model="nameInputValue" :validated="nameInputErrorValue" spellcheck="false" w="200px" />

    <div
      v-if="repositoryFolderName && nameInputValue !== repositoryFolderName"
      col-start="2"
      flex
      overflow-hidden
    >
      <span text-help truncate>{{ repositoryFolderName }}</span>
      <span text-link m="l-2px" text-nowrap @click="fillProjectName">
        {{ t('new_project.kind_component.fill_in') }}
      </span>
    </div>
  </ConfigItem>
</template>
