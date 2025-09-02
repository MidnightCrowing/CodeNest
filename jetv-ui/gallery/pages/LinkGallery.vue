<script lang="ts" setup>
import { JeLink } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <!-- Default -->
    <GalleryCard title="Default">
      <div flex="~ col" gap="10px">
        <JeLink>This is a link</JeLink>
        <JeLink type="web">
          Web link example
        </JeLink>
      </div>
    </GalleryCard>

    <!-- Type -->
    <GalleryCard title="Type">
      <div flex="~ row items-center" gap="20px">
        <JeLink type="internal">
          Internal
        </JeLink>
        <JeLink type="web">
          Web
        </JeLink>
        <JeLink type="options">
          Options
        </JeLink>
      </div>
    </GalleryCard>

    <!-- Disabled -->
    <GalleryCard title="Disabled">
      <div flex="~ col" gap="10px">
        <JeLink disabled>
          This link is disabled
        </JeLink>
        <JeLink type="web" disabled>
          Web link disabled
        </JeLink>
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>

<style lang="scss" scoped>
/* 可选：让 Type 栏中的 link 宽度统一，便于对比 */
.TypeLinks > * {
  min-width: 100px;
}
</style>
