<script setup lang="ts">
import { ref } from 'vue'

import { JeSwitch } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

const switchDefault = ref(false)
const switchWithLabels = ref(true)
const switchDisabled = ref(false)
</script>

<template>
  <ShowcaseFrame>
    <!-- Default -->
    <GalleryCard title="Default">
      <JeSwitch v-model="switchDefault">
        Default switch
      </JeSwitch>
      <div text="secondary">
        Value: {{ switchDefault }}
      </div>
    </GalleryCard>

    <!-- With Labels -->
    <GalleryCard title="With Labels">
      <JeSwitch
        v-model="switchWithLabels"
        on-label="ON"
        off-label="OFF"
      >
        Switch with labels
      </JeSwitch>
      <div text="secondary">
        Value: {{ switchWithLabels }}
      </div>
    </GalleryCard>

    <!-- Disabled -->
    <GalleryCard title="Disabled">
      <JeSwitch v-model="switchDisabled" disabled>
        Disabled switch
      </JeSwitch>
      <div text="secondary">
        Value: {{ switchDisabled }}
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
