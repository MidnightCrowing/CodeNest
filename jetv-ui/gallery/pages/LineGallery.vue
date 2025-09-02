<script lang="ts" setup>
import { JeLine } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="Default">
      <JeLine w-full />
    </GalleryCard>

    <GalleryCard title="Line Width">
      <div w-full flex="~ col gap-10px">
        <JeLine w-full />
        <JeLine w="3/4" />
        <JeLine w="1/2" />
      </div>
    </GalleryCard>

    <GalleryCard title="Line Color">
      <div w-full flex="~ row items-center gap-20px">
        <JeLine w-32 bg="$gray-12!" />
        <JeLine w-32 bg="$blue-5!" />
        <JeLine w-32 bg="$red-5!" />
      </div>
    </GalleryCard>

    <GalleryCard title="Line Orientation">
      <div flex="~ row items-center" gap="20px">
        <JeLine w="100px" />
        <JeLine vertical h="100px" />
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
