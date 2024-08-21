<!-- https://www.electronjs.org/zh/docs/latest/tutorial/window-customization -->
<template>
  <div class="window-header">
    <span relative left="30px" lh="20px">CodeNest</span>
  </div>
</template>

<style scoped lang="scss">
.window-header {
  -webkit-app-region: drag;
  -webkit-user-select: none;
  --uno: "min-h-40px max-h-40px w-full";
  --uno: "flex flex-row items-center";
  --uno: "bg-theme-window-focusIn";
}
</style>
