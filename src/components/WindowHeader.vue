<!-- https://www.electronjs.org/zh/docs/latest/tutorial/window-customization -->
<template>
  <div class="window-header">
    <span relative left="30px" text-default lh="20px">CodeNest</span>
  </div>
</template>

<style scoped lang="scss">
.window-header {
  -webkit-app-region: drag;
  --uno: "h-40px w-full";
  --uno: "flex flex-row items-center";
  --uno: "bg-$bg-2";
}
</style>
