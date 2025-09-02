<script lang="ts" setup>
import { JeBarColorSchemeEnum, JeColorIcon } from '../../src'
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
      <div grid="~ cols-2 items-center" gap="10px">
        <template v-for="(color, index) in colorSchemes" :key="index">
          <div text="default-semibold">
            {{ color.name }}
          </div>
          <JeColorIcon :color-scheme="JeBarColorSchemeEnum[color.scheme]" />
        </template>
      </div>
    </GalleryCard>

    <GalleryCard title="Type">
      <div grid="~ cols-4 items-center" gap="10px">
        <div text="default-semibold">
          ColorEnum
        </div>
        <div text="default-semibold">
          default
        </div>
        <div text="default-semibold">
          circle
        </div>
        <div text="default-semibold">
          vertical-bar
        </div>

        <template v-for="(color, index) in colorSchemes" :key="index">
          <div text="default-semibold">
            {{ color.name }}
          </div>
          <JeColorIcon
            type="default"
            :color-scheme="JeBarColorSchemeEnum[color.scheme]"
          />
          <JeColorIcon
            type="circle"
            :color-scheme="JeBarColorSchemeEnum[color.scheme]"
          />
          <JeColorIcon
            type="vertical-bar"
            :color-scheme="JeBarColorSchemeEnum[color.scheme]"
          />
        </template>
      </div>
    </GalleryCard>

    <GalleryCard title="Custom Color">
      <div grid="~ cols-2 items-center" gap="10px">
        <div text="default-semibold">
          Solid
        </div>
        <JeColorIcon custom-color="var(--my-solid)" />

        <div text="default-semibold">
          Gradient
        </div>
        <JeColorIcon custom-color="var(--my-gradient)" />
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>

<style lang="scss">
:root {
  --my-solid: #3498db; /* 纯色 */
  --my-gradient: linear-gradient(45deg, #ff6b6b, #feca57); /* 渐变 */
}
</style>
