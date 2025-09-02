<script lang="ts" setup>
import { ref } from 'vue'

import { JeCheckbox } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

const basicChecked = ref<boolean>(true)
const indeterminateChecked = ref<boolean>(true)
const unchecked = ref<boolean>(false)
const uncheckedDisabled = ref<boolean>(false)
const checked = ref<boolean>(true)
const checkedDisabled = ref<boolean>(true)
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="Default">
      <JeCheckbox v-model="basicChecked">
        Basic usage
      </JeCheckbox>
    </GalleryCard>

    <GalleryCard title="Indeterminate State">
      <JeCheckbox v-model="indeterminateChecked" indeterminate>
        Indeterminate example
      </JeCheckbox>
    </GalleryCard>

    <GalleryCard title="Disabled">
      <div grid="~ cols-2" gap="10px">
        <JeCheckbox v-model="unchecked">
          Unchecked
        </JeCheckbox>
        <JeCheckbox v-model="uncheckedDisabled" disabled>
          Unchecked (Disabled)
        </JeCheckbox>
        <JeCheckbox v-model="checked">
          Checked
        </JeCheckbox>
        <JeCheckbox v-model="checkedDisabled" disabled>
          Checked (Disabled)
        </JeCheckbox>
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
