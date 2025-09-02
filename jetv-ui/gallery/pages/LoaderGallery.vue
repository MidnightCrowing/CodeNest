<script lang="ts" setup>
import { JeLoader } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="Default">
      <JeLoader />
    </GalleryCard>

    <GalleryCard title="Loader Sizes">
      <div flex="~ row items-center" gap="20px">
        <JeLoader size="1em!" />
        <JeLoader size="1.5em!" />
        <JeLoader size="2em!" />
      </div>
    </GalleryCard>

    <GalleryCard title="With Text">
      <div flex="~ row items-center" gap="10px">
        <JeLoader />
        <span text="secondary">Loading data...</span>
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
