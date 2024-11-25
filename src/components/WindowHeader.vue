<!-- https://www.electronjs.org/zh/docs/latest/tutorial/window-customization -->

<script lang="ts" setup>
import { JeFrame } from '~/jetv-ui'
</script>

<template>
  <JeFrame
    class="window-header"
    :type="null"
    min-h-40px max-h-40px w-full
    flex="~ row items-center"
    bg="light:#F2F2F2 dark:#2B2D30"
  >
    <span relative left="30px" lh="20px">CodeNest</span>
  </JeFrame>
</template>

<style lang="scss" scoped>
.window-header {
  -webkit-app-region: drag;
  -webkit-user-select: none;
}
</style>
