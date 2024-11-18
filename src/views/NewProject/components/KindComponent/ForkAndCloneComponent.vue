<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { JeInputField, JeLink } from '~/jetv-ui'
import ConfigItemTitle from '~/views/NewProject/components/common/ConfigItemTitle.vue'

const { t } = useI18n()

// 用于获取输入框的内容
const projectUrlInputValue = ref('')
const projectNameInputValue = ref('')
// 用于存储匹配结果
const repositoryPath = ref('')

// 监听 URL 输入框内容的变化
watch(projectUrlInputValue, (newValue) => {
  const match = newValue.match(/github\.com\/([^/]+\/[^/]+)/)
  repositoryPath.value = match ? match[1] : ''
})

function fillProjectName() {
  projectNameInputValue.value = repositoryPath.value
}
</script>

<template>
  <ConfigItemTitle title="new_project.kind_component.project_url" />
  <JeInputField v-model="projectUrlInputValue" />

  <ConfigItemTitle title="new_project.kind_component.project_name" />
  <JeInputField v-model="projectNameInputValue" />

  <div
    v-if="repositoryPath && projectNameInputValue !== repositoryPath"
    col-start="2"
    flex gap="2px"
    overflow-hidden
  >
    <span text="secondary" truncate>{{ repositoryPath }}</span>
    <JeLink :on-click="fillProjectName">
      {{ t('new_project.kind_component.fill_in') }}
    </JeLink>
  </div>
</template>
