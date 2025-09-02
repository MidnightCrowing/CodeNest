<script lang="ts" setup>
import { ref } from 'vue'

import { JeCombobox, JeDropdown, JeFileInputField, JeInputField, JeSearchField, JeToolbarDropdown } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

const inputValue = ref('')
const dropdownValue = ref('option1')
const toolbarDropdownValue = ref('tool1')
const comboboxValue = ref('')
const searchValue = ref('')
const fileValue = ref<string | null>(null)

const dropdownOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
]

const toolbarOptions = [
  { label: 'Tool A', value: 'tool1' },
  { label: 'Tool B', value: 'tool2' },
]

const comboOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
]
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="InputField">
      <JeInputField v-model="inputValue" placeholder="Type something..." />
      <div text="secondary">
        Value: {{ inputValue }}
      </div>
    </GalleryCard>

    <GalleryCard title="Dropdown">
      <JeDropdown v-model="dropdownValue" :options="dropdownOptions" />
      <div text="secondary">
        Selected: {{ dropdownValue }}
      </div>
    </GalleryCard>

    <GalleryCard title="ToolbarDropdown">
      <JeToolbarDropdown
        v-model="toolbarDropdownValue"
        label="Toolbar Dropdown"
        :options="toolbarOptions"
        default-selected-value="tool1"
      />
      <div text="secondary">
        Selected: {{ toolbarDropdownValue }}
      </div>
    </GalleryCard>

    <GalleryCard title="Combobox">
      <JeCombobox v-model="comboboxValue" :options="comboOptions" placeholder="Pick a fruit" />
      <div text="secondary">
        Value: {{ comboboxValue }}
      </div>
    </GalleryCard>

    <GalleryCard title="SearchField">
      <JeSearchField v-model="searchValue" placeholder="Search something..." />
      <div text="secondary">
        Search: {{ searchValue }}
      </div>
    </GalleryCard>

    <GalleryCard title="FileInputField">
      <JeFileInputField v-model="fileValue" />
      <div text="secondary">
        File: {{ fileValue }}
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
