<script lang="ts" setup>
import { JeShortcut } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <!-- Default -->
    <GalleryCard title="Default">
      <JeShortcut :keys="['Ctrl', 'S']" />
    </GalleryCard>

    <!-- Outline type -->
    <GalleryCard title="Outline">
      <JeShortcut type="outline" :keys="['Ctrl', 'Shift', 'N']" />
    </GalleryCard>

    <!-- Multiple combinations -->
    <GalleryCard title="Multiple Combinations">
      <div flex="~ col gap-10px">
        <JeShortcut :keys="['Ctrl', 'Alt', 'Del']" />
        <JeShortcut type="outline" :keys="['Cmd', 'Option', 'Esc']" />
        <JeShortcut :keys="['Shift', 'A']" />
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
