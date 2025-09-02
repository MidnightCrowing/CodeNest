<script lang="ts" setup>
import { JeButton, JeSlimButton } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="Default">
      <JeButton>Example</JeButton>
    </GalleryCard>

    <GalleryCard title="Type">
      <div flex="~ row items-center" gap="x-10px">
        <JeButton type="primary">
          primary
        </JeButton>
        <JeButton type="secondary">
          Secondary
        </JeButton>
        <JeButton type="secondary-alt">
          Secondary Alt
        </JeButton>
      </div>
    </GalleryCard>

    <GalleryCard title="Disabled">
      <div grid="~ cols-2" gap="10px">
        <JeButton type="primary">
          Enabled state
        </JeButton>
        <JeButton type="primary" disabled>
          Disabled state
        </JeButton>
        <JeButton type="secondary">
          Enabled state
        </JeButton>
        <JeButton type="secondary" disabled>
          Disabled state
        </JeButton>
      </div>
    </GalleryCard>

    <GalleryCard title="Slim">
      <div flex="~ col gap-4">
        <!-- Default group -->
        <div flex="~ row gap-3">
          <JeSlimButton type="default">
            Default Type
          </JeSlimButton>
          <JeSlimButton type="default" disabled>
            Default Disabled
          </JeSlimButton>
        </div>

        <!-- Alt group -->
        <div flex="~ row gap-3">
          <JeSlimButton type="alt">
            Alt Type
          </JeSlimButton>
          <JeSlimButton type="alt" disabled>
            Alt Disabled
          </JeSlimButton>
        </div>
      </div>
    </GalleryCard>
  </showcaseframe>
</template>
