<script lang="ts" setup>
import { JeFrame } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="Types">
      <div flex="~ col gap-10px">
        <JeFrame type="primary" p="10px">
          Primary Frame Content
        </JeFrame>
        <JeFrame type="secondary" p="10px">
          Secondary Frame Content
        </JeFrame>
      </div>
    </GalleryCard>

    <GalleryCard title="Frame with Content">
      <JeFrame type="primary" p="20px" flex="~ col gap-10px">
        <h3 text="lg">
          User Info
        </h3>
        <p>Name: John Doe</p>
        <p>Email: john@example.com</p>
      </JeFrame>
    </GalleryCard>
  </ShowcaseFrame>
</template>
