<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { LocalProject } from '~/constants/localProject'
import { JeInputField, JeLink } from '~/jetv-ui'

import ConfigItemTitle from '../common/ConfigItemTitle.vue'

const props = defineProps<{
  localProjectItem: LocalProject
}>()
const emit = defineEmits(['update:projectFromUrl', 'update:projectFromName'])

const { t } = useI18n()

// 用于获取输入框的内容
const projectUrlInputValue = ref(props.localProjectItem.fromUrl || '')
const projectNameInputValue = ref(props.localProjectItem.fromName || '')
// 用于存储匹配结果
const repositoryPath = ref('')

function fillProjectName() {
  projectNameInputValue.value = repositoryPath.value
}

watch(projectUrlInputValue, (newValue) => {
  emit('update:projectFromUrl', newValue)
  if (newValue) {
    const match = newValue.match(/github\.com\/([^/]+\/[^/]+)/)
    repositoryPath.value = match ? match[1] : ''
  }
})

watch(projectNameInputValue, (newValue) => {
  emit('update:projectFromName', newValue)
})
</script>

<template>
  <ConfigItemTitle title="new_project.kind.url" />
  <JeInputField v-model="projectUrlInputValue" />

  <ConfigItemTitle title="new_project.kind.name" />
  <JeInputField v-model="projectNameInputValue" />

  <div
    v-if="repositoryPath && projectNameInputValue !== repositoryPath"
    col-start="2"
    flex gap="2px"
    overflow-hidden
  >
    <span text="secondary" truncate>{{ repositoryPath }}</span>
    <JeLink :on-click="fillProjectName">
      {{ t('new_project.kind.fill') }}
    </JeLink>
  </div>
</template>
