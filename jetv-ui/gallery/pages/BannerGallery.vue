<script lang="ts" setup>
import { JeBanner } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

function handleClick() {
  window.alert('Action clicked!')
}
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="Default">
      <JeBanner state="info">
        Info Example
      </JeBanner>
      <JeBanner state="success">
        Success Example
      </JeBanner>
      <JeBanner state="warning">
        Warning Example
      </JeBanner>
      <JeBanner state="error">
        Error Example
      </JeBanner>
    </GalleryCard>

    <GalleryCard title="Type">
      <div grid="~ cols-[auto_1fr] items-center" gap="10px" w-full>
        <div text="default-semibold">
          default
        </div>
        <JeBanner state="info" type="default">
          This is the default type banner, used to display general information.
        </JeBanner>

        <div text="default-semibold">
          inline
        </div>
        <JeBanner state="info" type="inline">
          This is the inline type banner, suitable for embedding complex content.
          <ul>
            <li>Supports lists</li>
            <li>Supports nested tags</li>
            <li>Supports custom styles</li>
          </ul>
          <div>For example: nested <strong>HTML</strong> content</div>
        </JeBanner>
      </div>
    </GalleryCard>

    <GalleryCard title="Actions">
      <JeBanner
        state="info"
        type="default"
        :actions="[{
          label: 'Action',
          onClick: handleClick,
        }]"
      >
        Click the action button
      </JeBanner>
    </GalleryCard>
  </ShowcaseFrame>
</template>
