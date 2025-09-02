<script lang="ts" setup>
import { JeCard, JeSimpleCard } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="Default">
      <JeCard p="20px">
        This is a default card, used to display general content or information.
      </JeCard>
    </GalleryCard>

    <GalleryCard title="SimpleCard">
      <JeSimpleCard p="20px">
        This is a simple card, suitable for presenting concise and focused content.
      </JeSimpleCard>
    </GalleryCard>
  </ShowcaseFrame>
</template>
