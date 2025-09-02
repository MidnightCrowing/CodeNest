<script lang="ts" setup>
import { JeTooltip } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'
</script>

<template>
  <ShowcaseFrame>
    <!-- Default -->
    <GalleryCard title="Default" type="primary">
      <div relative h="40px">
        <JeTooltip state="info" direction="up">
          Info tooltip
        </JeTooltip>
      </div>
    </GalleryCard>

    <!-- Different States -->
    <GalleryCard title="States" type="primary">
      <div relative h="40px">
        <JeTooltip left="0" state="info" direction="up">
          Info
        </JeTooltip>
        <JeTooltip left="70px" state="success" direction="up">
          Success
        </JeTooltip>
        <JeTooltip left="170px" state="warning" direction="up">
          Warning
        </JeTooltip>
        <JeTooltip left="270px" state="error" direction="up">
          Error
        </JeTooltip>
      </div>
    </GalleryCard>

    <!-- Different Directions -->
    <GalleryCard title="Directions" type="primary">
      <div relative h="40px">
        <JeTooltip left="0" state="info" direction="up">
          Up
        </JeTooltip>
        <JeTooltip left="100px" state="info" direction="down">
          Down
        </JeTooltip>
        <JeTooltip left="200px" state="info" direction="left">
          Left
        </JeTooltip>
        <JeTooltip left="300px" state="info" direction="right">
          Right
        </JeTooltip>
      </div>
    </GalleryCard>

    <!-- Different Sizes -->
    <GalleryCard title="Sizes" type="primary">
      <div relative h="40px">
        <JeTooltip left="0" state="info" direction="up" size="small">
          Small
        </JeTooltip>
        <JeTooltip left="100px" state="info" direction="up" size="medium">
          Medium
        </JeTooltip>
      </div>
    </GalleryCard>
  </ShowcaseFrame>
</template>
