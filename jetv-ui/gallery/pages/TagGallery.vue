<script lang="ts" setup>
import { ref } from 'vue'

import { JeSlimTag, JeTag } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

// 可选标签状态
const selectedTag = ref(false)
const deletableTag = ref(true)
</script>

<template>
  <ShowcaseFrame>
    <!-- Default -->
    <GalleryCard title="Default">
      <JeTag>Default</JeTag>
    </GalleryCard>

    <!-- Selectable -->
    <GalleryCard title="Selectable">
      <JeTag v-model:select="selectedTag" select-able>
        Selectable
      </JeTag>
      <div text="secondary">
        Selected: {{ selectedTag }}
      </div>
    </GalleryCard>

    <!-- Deletable -->
    <GalleryCard title="Deletable">
      <JeTag
        v-if="deletableTag"
        v-model:delete="deletableTag" delete-able @remove="deletableTag = false"
      >
        Deletable
      </JeTag>
      <div text="secondary">
        Exists: {{ deletableTag }}
      </div>
    </GalleryCard>

    <!-- Disabled -->
    <GalleryCard title="Disabled">
      <JeTag disabled>
        Select / Delete disabled
      </JeTag>
    </GalleryCard>

    <!-- Slim -->
    <GalleryCard title="Slim">
      <JeSlimTag disabled>
        Default Slim
      </JeSlimTag>
    </GalleryCard>
  </ShowcaseFrame>
</template>
