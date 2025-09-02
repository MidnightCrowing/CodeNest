<script lang="ts" setup>
import { JeBarColorSchemeEnum, JeGradient } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

const colorSchemes = [
  { name: 'Amber', scheme: 'Amber' },
  { name: 'Rust', scheme: 'Rust' },
  { name: 'Olive', scheme: 'Olive' },
  { name: 'Grass', scheme: 'Grass' },
  { name: 'Ocean', scheme: 'Ocean' },
  { name: 'Sky', scheme: 'Sky' },
  { name: 'Cobalt', scheme: 'Cobalt' },
  { name: 'Violet', scheme: 'Violet' },
  { name: 'Plum', scheme: 'Plum' },
]
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="Default">
      <div w-full flex="~ col items-center" gap="y-10px">
        <template v-for="color in colorSchemes" :key="color">
          <JeGradient
            :color-scheme="JeBarColorSchemeEnum[color.scheme]"
            w-full h="30px" flex="~ row items-center justify-center"
          >
            <div text="default-semibold">
              {{ color.name }}
            </div>
          </JeGradient>
        </template>
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
