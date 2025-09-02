<script lang="ts" setup>
import { ref } from 'vue'

import { JeButton, JeMenu } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

const showDefaultMenu = ref(false)
const showGroupMenu = ref(false)
const showChildMenu = ref(false)

const defaultOptions = [
  { value: 'new', label: 'New File', shortcutKey: ['Ctrl', 'N'] },
  { value: 'open', label: 'Open File', shortcutKey: ['Ctrl', 'O'] },
  { isLine: true, value: 'line1' },
  { value: 'save', label: 'Save', shortcutKey: ['Ctrl', 'S'] },
  { value: 'exit', label: 'Exit' },
]

const groupOptions = [
  {
    value: 'file-group',
    groupLabel: 'File',
    options: [
      { value: 'new', label: 'New', key: 'N' },
      { value: 'open', label: 'Open', key: 'O' },
    ],
  },
  {
    value: 'edit-group',
    groupLabel: 'Edit',
    options: [
      { value: 'undo', label: 'Undo', key: 'Z' },
      { value: 'redo', label: 'Redo', key: 'Y' },
    ],
  },
]

const childMenuOptions = [
  {
    value: 'preferences',
    label: 'Preferences',
    childMenu: {
      options: [
        { value: 'theme', label: 'Theme' },
        { value: 'font', label: 'Font' },
      ],
    },
  },
  { value: 'about', label: 'About' },
]
</script>

<template>
  <ShowcaseFrame>
    <!-- Default -->
    <GalleryCard title="Default Menu">
      <div relative>
        <JeButton @click="showDefaultMenu = !showDefaultMenu">
          Toggle Menu
        </JeButton>
        <JeMenu
          v-model:visible="showDefaultMenu"
          :options="defaultOptions"
          class="absolute top-12 left-0"
        />
      </div>
    </GalleryCard>

    <!-- Group Menu -->
    <GalleryCard title="Grouped Menu">
      <div relative>
        <JeButton @click="showGroupMenu = !showGroupMenu">
          Toggle Grouped Menu
        </JeButton>
        <JeMenu
          v-model:visible="showGroupMenu"
          :options="groupOptions"
          class="absolute top-12 left-0"
        />
      </div>
    </GalleryCard>

    <!-- Child Menu -->
    <GalleryCard title="Menu with Submenu">
      <div relative>
        <JeButton @click="showChildMenu = !showChildMenu">
          Toggle Child Menu
        </JeButton>
        <JeMenu
          v-model:visible="showChildMenu"
          :options="childMenuOptions"
          class="absolute top-12 left-0"
        />
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
