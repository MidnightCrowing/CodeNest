<script lang="ts" setup>
import { JeFrame } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <div flex="~ col gap-20px p-20px" w-full>
      <!-- 安装说明 -->
      <GalleryCard title="Install via npm/yarn/pnpm">
        <div flex="~ col gap-10px" w-full>
          <JeFrame type="primary" p="x-10px y-15px" rounded="5px">
            pnpm add jetv-ui
          </JeFrame>
          <JeFrame type="primary" p="x-10px y-15px" rounded="5px">
            npm install jetv-ui
          </JeFrame>
          <JeFrame type="primary" p="x-10px y-15px" rounded="5px">
            yarn add jetv-ui
          </JeFrame>
        </div>
      </GalleryCard>
    </div>
  </ShowcaseFrame>
</template>
