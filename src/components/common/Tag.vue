<script setup lang="ts">
const props = defineProps<{
  icon?: string
  content: string
  annotation?: string
  deleteAble?: boolean
  selectAble?: boolean
  select?: boolean
}>()

const emit = defineEmits(['remove', 'select'])

const isSelected = ref(props.select)

function toggleSelect() {
  if (props.selectAble) {
    isSelected.value = !isSelected.value
    emit('select', isSelected.value)
  }
}

function removeTag() {
  emit('remove')
}
</script>

<template>
  <div
    class="tag"
    :class="[{ 'select-able': selectAble, 'selected': isSelected }]"
    inline-flex gap="0.25rem"
    items-center
    p="x-6px y-5px"
    border="solid 2px $border-1" rounded="5px"
    bg="$active-1"
    truncate cursor-default
    @click="toggleSelect"
  >
    <span v-if="icon" :class="icon" />
    <span>{{ content }}</span>
    <span v-if="annotation" text-comment>
      {{ annotation }}
    </span>
    <button
      v-if="deleteAble"
      cursor-pointer
      border-none
      i-mode="close-small hover:close-small-hovered"
      @click.stop="removeTag"
    />
  </div>
</template>

<style scoped lang="scss">
.tag.select-able {
  --uno: "bg-transparent";

  &.selected {
    --uno: "bg-$active-2";
    --uno: "border-$white-3";
  }
}
</style>
