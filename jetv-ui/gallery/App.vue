<script lang="ts" setup>
import { RouterView, useRouter } from 'vue-router'

import { JeFrame } from '../src/index'
import SidebarMenuItem from './components/SidebarMenuItem.vue'
import { routes } from './router'

const router = useRouter()

interface MenuItem {
  value: string
  label: string
  link: string
}

const componentsMenuItems: MenuItem[] = routes
  .filter(route => !route.meta?.hiddenInMenu && route.name) // 只显示有 name 的路由
  .map(route => ({
    value: route.name!,
    label: route.meta.label || route.name!,
    link: route.path,
  }))

function goTo(url: string) {
  router.push(url)
}
</script>

<template>
  <JeFrame
    type="primary"
    flex="~ row items-start justify-start"
    size-full
  >
    <JeFrame
      type="secondary"
      shrink-0
      h-full w="250px" p="t-20px" box-border
      flex="~ col items-center justify-start" gap="20px"
    >
      <span
        text="h1" cursor-pointer
        @click="goTo('/')"
      >
        JetV-ui Gallery
      </span>

      <JeFrame
        type="secondary"
        w-full p="x-0px" box-border
        flex="~ col items-center justify-start"
        overflow-auto
      >
        <div
          w-full p="x-10px y-5px" box-border
          text="default-semibold"
        >
          Concepts
        </div>
        <SidebarMenuItem value="introduction" label="Introduction" link="/introduction" />
        <SidebarMenuItem value="installation" label="Installation" link="/installation" />

        <div
          w-full p="x-10px t-10px b-5px" box-border
          text="default-semibold"
        >
          Components
        </div>
        <SidebarMenuItem
          v-for="item in componentsMenuItems"
          :key="item.value"
          :value="item.value"
          :label="item.label"
          :link="item.link"
        />
      </JeFrame>
    </JeFrame>

    <div grow h-full p="x-10px" box-border>
      <RouterView />
    </div>
  </JeFrame>
</template>

<style lang="scss" scoped>
.menu-item.active {
  @apply light:bg-$blue-11 dark:bg-$blue-2;
}
</style>
