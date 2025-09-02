<script lang="ts" setup>
import { ref } from 'vue'

import { JeRadio } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

const basicChecked = ref<string | null>(null)

const disabledChecked = ref<string | null>('2')
</script>

<template>
  <ShowcaseFrame>
    <!-- 默认用例 -->
    <GalleryCard title="Default">
      <div flex="~ col gap-2">
        <JeRadio v-model="basicChecked" value="1">
          Option 1
        </JeRadio>
        <JeRadio v-model="basicChecked" value="2">
          Option 2
        </JeRadio>
        <JeRadio v-model="basicChecked" value="3">
          Option 3
        </JeRadio>
      </div>
    </GalleryCard>

    <!-- 禁用用例 -->
    <GalleryCard title="Disabled">
      <div flex="~ col gap-2">
        <JeRadio v-model="disabledChecked" value="1" disabled>
          Disabled Option 1
        </JeRadio>
        <JeRadio v-model="disabledChecked" value="2">
          Enabled Option 2
        </JeRadio>
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
