<script lang="ts" setup>
import { JeFrame } from 'jetv-ui'

import ProjectOverview from './ProjectOverview/ProjectOverview.vue'
import SidePanel from './SidePanel.vue'

// 管理左侧菜单选中的项
const activatedItem = ref('k-all')

// 更新激活的菜单项
function updateActivatedItem(itemMark: string) {
  activatedItem.value = itemMark
}
</script>

<template>
  <JeFrame flex="~ row" w-100vw overflow-hidden>
    <SidePanel
      :activated-item="activatedItem"
      @update-activated-item="updateActivatedItem"
    />
    <ProjectOverview
      :activated-item="activatedItem"
      grow overflow-hidden
    />
  </JeFrame>
</template>
