<script lang="ts" setup>
import { JeCommandLinkButton } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="Default">
      <div flex="~ col gap-10px" w="200px">
        <JeCommandLinkButton>Open File</JeCommandLinkButton>
        <JeCommandLinkButton>Save Changes</JeCommandLinkButton>
        <JeCommandLinkButton>Delete Item</JeCommandLinkButton>
      </div>
    </GalleryCard>

    <GalleryCard title="Disabled">
      <div flex="~ col gap-10px" w="200px">
        <JeCommandLinkButton disabled>
          Open File
        </JeCommandLinkButton>
        <JeCommandLinkButton disabled>
          Save Changes
        </JeCommandLinkButton>
        <JeCommandLinkButton disabled>
          Delete Item
        </JeCommandLinkButton>
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
