<script lang="ts" setup>
import { ref } from 'vue'

import { JeSegmentedControl } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

const selected = ref<string>('option1')
const disableSelected = ref<string>('option1')

const options = [
  { value: 'option1', label: '选项一' },
  { value: 'option2', label: '选项二' },
  { value: 'option3', label: '选项三' },
]
</script>

<template>
  <ShowcaseFrame>
    <!-- 基础用法 -->
    <GalleryCard title="Default">
      <JeSegmentedControl
        v-model="selected"
        :labels="options"
      />
      <div text="default">
        当前选择：<strong>{{ selected }}</strong>
      </div>
    </GalleryCard>

    <!-- 禁用状态 -->
    <GalleryCard title="Disabled">
      <JeSegmentedControl
        v-model="disableSelected"
        :labels="options"
        disabled
      />
    </GalleryCard>
  </ShowcaseFrame>
</template>
