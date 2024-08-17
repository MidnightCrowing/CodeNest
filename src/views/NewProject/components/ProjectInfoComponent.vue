<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import InputField from '~/components/common/InputField.vue'
import PathInputField from '~/components/common/PathInputField.vue'

import ConfigItem from './common/ConfigItem.vue'
import ConfigItemTitle from './common/ConfigItemTitle.vue'

const { t } = useI18n()

const pathInputValue = ref('')
const projectNameInputValue = ref('')
const repositoryFolderName = ref('')

watch(pathInputValue, (newValue) => {
  // 提取路径的最后一个文件夹名称
  const parts = newValue.split(/[\\/]/)
  repositoryFolderName.value = parts[parts.length - 1] || ''
})

function fillProjectName() {
  projectNameInputValue.value = repositoryFolderName.value
}
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.directory" />
    <PathInputField v-model="pathInputValue" grow />
    <ConfigItemTitle title="new_project.name" />
    <InputField v-model="projectNameInputValue" spellcheck="false" w="200px" :warning="true" />

    <div
      v-if="repositoryFolderName && projectNameInputValue !== repositoryFolderName"
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
