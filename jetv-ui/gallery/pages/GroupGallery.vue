<script setup lang="ts">
import { JeGroup } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
</script>

<template>
  <div grid="~ cols-1 gap-6">
    <!-- Primary Group -->
    <GalleryCard title="Primary Group (展开)">
      <JeGroup label="主分组" label-type="primary" :expandable="true" :is-expand="true">
        <div p="4" text="secondary">
          这里是主分组的内容（展开状态）。
        </div>
      </JeGroup>
    </GalleryCard>

    <!-- Secondary Group -->
    <GalleryCard title="Secondary Group (折叠)">
      <JeGroup label="次分组" label-type="secondary" :expandable="true" :is-expand="false">
        <div p="4" text="secondary">
          这里是次分组的内容（折叠状态）。
        </div>
      </JeGroup>
    </GalleryCard>

    <!-- 不可折叠 -->
    <GalleryCard title="不可折叠 Group">
      <JeGroup label="固定展开分组" :expandable="false">
        <div p="4" text="secondary">
          这个分组不可折叠，始终显示内容。
        </div>
      </JeGroup>
    </GalleryCard>
  </div>
</template>
