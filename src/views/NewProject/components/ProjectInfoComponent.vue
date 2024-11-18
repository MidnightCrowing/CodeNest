<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { JeFileInputField, JeInputField, JeLink } from '~/jetv-ui'

import ConfigItem from './common/ConfigItem.vue'
import ConfigItemTitle from './common/ConfigItemTitle.vue'

const { t } = useI18n()

const pathInputValue = ref('')
const nameInputValue = ref('')
const repositoryFolderName = ref('')

watch(pathInputValue, (newValue) => {
  // 提取路径的最后一个文件夹名称
  const parts = newValue.split(/[\\/]/)
  repositoryFolderName.value = parts[parts.length - 1] || ''
})

function fillProjectName() {
  nameInputValue.value = repositoryFolderName.value
}
</script>

<template>
  <ConfigItem>
    <ConfigItemTitle title="new_project.directory" />
    <JeFileInputField v-model="pathInputValue" grow />
    <ConfigItemTitle title="new_project.name" />
    <JeInputField v-model="nameInputValue" spellcheck="false" w="200px" />

    <div
      v-if="repositoryFolderName && nameInputValue !== repositoryFolderName"
      col-start="2"
      flex gap="2px"
      overflow-hidden
    >
      <span text="secondary" truncate>{{ repositoryFolderName }}</span>
      <JeLink :on-click="fillProjectName">
        {{ t('new_project.kind_component.fill_in') }}
      </JeLink>
    </div>
  </ConfigItem>
</template>
