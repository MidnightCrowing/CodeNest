<script lang="ts" setup>
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <div
      font="[JetBrains_Mono,monospace]"
      p="2rem" rounded="0.75rem"
      bg="#2b2d30"
    >
      <h1 text="h1">
        JetV-UI
      </h1>
      <p lh="1.6rem" m="b-1.25rem" color="#c8c8c8">
        jetv-ui 是一个根据 JetBrains 产品 UI 界面设计风格进行模仿的 UI 组件库。目前库中包含部分常用组件，后续会持续完善。
      </p>
      <p lh="1.6rem" m="b-1.25rem" color="#c8c8c8">
        本组件库更适合在桌面端使用。
      </p>

      <span text="default">参考资料：</span>
      <a
        href="https://www.figma.com/@JetBrains"
        target="_blank"
        rel="noopener noreferrer"
        color="#4ea1f3 hover:#76c2ff"
        decoration="none hover:underline"
        transition="color 200 ease"
      >
        IntelliJ Platform UI kit
      </a>
    </div>
  </ShowcaseFrame>
</template>
