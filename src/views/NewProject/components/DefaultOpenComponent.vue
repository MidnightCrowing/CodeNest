<script setup lang="ts">
import type { CodeEditorOption } from '~/constants/codeEditor'
import { codeEditors } from '~/constants/codeEditor'
import type { JeDropdownOption, JeDropdownOptionGroup } from '~/jetv-ui'
import { JeDropdown } from '~/jetv-ui'
import ConfigItem from '~/views/NewProject/components/common/ConfigItem.vue'
import ConfigItemTitle from '~/views/NewProject/components/common/ConfigItemTitle.vue'

const selectedValue = ref('')

// 将 CodeEditorOption 转换为 Dropdown 可接受的 options
function transformCodeEditorOptionsToDropdownOptions(codeEditorOptions: CodeEditorOption[]): (JeDropdownOption | JeDropdownOptionGroup)[] {
  const groupedOptions = new Map<string, JeDropdownOption[]>()

  // 按照 group 分类 CodeEditorOption
  for (const { value, label, icon, description, group } of codeEditorOptions) {
    const key = group || 'default'
    if (!groupedOptions.has(key)) {
      groupedOptions.set(key, [])
    }
    groupedOptions.get(key)!.push({ value, label, icon, description })
  }

  // 构造结果：未分组的为单独项，有分组的归为 OptionGroup
  return Array.from(groupedOptions, ([group, options]) =>
    group === 'default'
      ? options // 未分组，直接加入结果
      : { value: group, groupLabel: group, options }).flat()
}
</script>

<template>
  <ConfigItem>
    <!-- 配置项标题 -->
    <ConfigItemTitle title="new_project.default_opening_method" />
    <!-- 下拉菜单组件 -->
    <JeDropdown
      v-model:modelValue="selectedValue"
      :options="transformCodeEditorOptionsToDropdownOptions(codeEditors)"
    />
  </ConfigItem>
</template>
