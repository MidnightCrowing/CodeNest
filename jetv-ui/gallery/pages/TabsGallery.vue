<script lang="ts" setup>
import { reactive, ref } from 'vue'

import { JeSlimButton, JeTabPane, JeTabs } from '../../src'
import GalleryCard from '../components/GalleryCard.vue'
import ShowcaseFrame from '../components/ShowcaseFrame.vue'

// 基础
const basicActive = ref<string | number>('tab1')

// 全局 closable
const closableActive = ref<string | number>('c1')

// 动态增删
interface DynTab { value: string, label: string, closable?: boolean }
const dynActive = ref<string | number>('d1')
const dynTabs = reactive<DynTab[]>([
  { value: 'd1', label: '文件 1', closable: true },
  { value: 'd2', label: '文件 2', closable: true },
])
let dynIndex = 3
function handleDynAdd() {
  const v = `d${dynIndex++}`
  dynTabs.push({ value: v, label: `文件 ${v.slice(1)}`, closable: true })
  dynActive.value = v
}
function handleDynClose(v: string | number) {
  const i = dynTabs.findIndex(t => t.value === v)
  if (i !== -1)
    dynTabs.splice(i, 1)
}

// 图标 + 禁用
const iconActive = ref<string | number>('home')

// 懒加载
const lazyActive = ref<string | number>('l1')
</script>

<template>
  <ShowcaseFrame>
    <GalleryCard title="基础用法">
      <JeTabs v-model="basicActive">
        <JeTabPane value="tab1" label="概览" />
        <JeTabPane value="tab2" label="配置" />
        <JeTabPane value="tab3" label="日志" />
      </JeTabs>
      <div text="default" mt-8px>
        当前：{{ basicActive }}
      </div>
    </GalleryCard>

    <GalleryCard title="全局可关闭 (closable)">
      <JeTabs v-model="closableActive" closable>
        <JeTabPane value="c1" label="文件 A" />
        <JeTabPane value="c2" label="文件 B" />
        <JeTabPane value="c3" label="文件 C" />
      </JeTabs>
    </GalleryCard>

    <GalleryCard title="动态增删 (addable + 事件)">
      <JeTabs
        v-model="dynActive"
        addable
        @tab-add="handleDynAdd"
        @tab-close="handleDynClose"
      >
        <JeTabPane
          v-for="t in dynTabs"
          :key="t.value"
          :value="t.value"
          :label="t.label"
          :closable="t.closable"
        />
      </JeTabs>
      <div flex gap-8px mt-8px>
        <JeSlimButton @click="handleDynAdd">
          新增标签
        </JeSlimButton>
        <span text="secondary">当前：{{ dynActive }}</span>
      </div>
    </GalleryCard>

    <GalleryCard title="图标 + 禁用">
      <JeTabs v-model="iconActive">
        <JeTabPane value="home" label="Home" icon="light:i-jet:info dark:i-jet:info-dark" />
        <JeTabPane value="settings" label="Settings" icon="light:i-jet:settings dark:i-jet:settings-dark" />
        <JeTabPane value="disabled" label="Disabled" disabled icon="light:i-jet:warning dark:i-jet:warning-dark" />
      </JeTabs>
    </GalleryCard>

    <GalleryCard title="懒加载 (lazy)">
      <JeTabs v-model="lazyActive">
        <JeTabPane value="l1" label="概览" lazy>
          <div p-8px>
            概览内容 (立即渲染)
          </div>
        </JeTabPane>
        <JeTabPane value="l2" label="大数据" lazy>
          <div p-8px>
            大数据内容（首次点击才渲染）
          </div>
        </JeTabPane>
        <JeTabPane value="l3" label="统计" lazy>
          <div p-8px>
            统计内容（首次点击才渲染）
          </div>
        </JeTabPane>
      </JeTabs>
    </GalleryCard>
  </ShowcaseFrame>
</template>
