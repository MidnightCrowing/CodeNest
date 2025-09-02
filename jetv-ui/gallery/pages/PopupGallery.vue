<script lang="ts" setup>
import { ref } from 'vue'

import { JeButton, JePopup } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

const showPopup = ref(false)

function togglePopup() {
  showPopup.value = !showPopup.value
}
</script>

<template>
  <ShowcaseFrame relative>
    <GalleryCard title="Default">
      <div class="p-4">
        <!-- 按钮 -->
        <JeButton @click="togglePopup">
          {{ showPopup ? '关闭 Popup' : '打开 Popup' }}
        </JeButton>
      </div>
    </GalleryCard>

    <!-- Popup -->
    <JePopup
      v-if="showPopup"
      top="110px" left="30px" min-w="60" p="4"
    >
      <h3 text="h2">
        我是 Popup
      </h3>
      <p text="default">
        这里是弹出的内容，可以放任何组件。
      </p>
      <div m="t-4" flex="~ justify-end">
        <JeButton @click="showPopup = false">
          确定
        </JeButton>
      </div>
    </JePopup>
  </ShowcaseFrame>
</template>
