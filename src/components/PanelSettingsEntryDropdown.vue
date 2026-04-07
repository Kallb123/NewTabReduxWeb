<script setup lang="ts">
import Dropdown from './Dropdown.vue';

const props = defineProps<{
  index: number;
  length: number;
  moveEntry: (index: number, direction: 'top' | 'up' | 'down' | 'bottom') => void;
  deleteEntry: (index: number) => void;
}>();
</script>

<template>
  <Dropdown>
    <template #trigger="{ open }">
      <button class="entry-menu-btn" :aria-expanded="open" title="Entry options">
        <font-awesome-icon icon="fa-solid fa-chevron-down" />
      </button>
    </template>
    <template #default="{ close }">
      <li>
        <button :disabled="index === 0" @click="close(); moveEntry(index, 'top')">
          <font-awesome-icon icon="fa-solid fa-angles-up" /> Move to Top
        </button>
      </li>
      <li>
        <button :disabled="index === 0" @click="close(); moveEntry(index, 'up')">
          <font-awesome-icon icon="fa-solid fa-angle-up" /> Move Up
        </button>
      </li>
      <li>
        <button :disabled="index === length - 1" @click="close(); moveEntry(index, 'down')">
          <font-awesome-icon icon="fa-solid fa-angle-down" /> Move Down
        </button>
      </li>
      <li>
        <button :disabled="index === length - 1" @click="close(); moveEntry(index, 'bottom')">
          <font-awesome-icon icon="fa-solid fa-angles-down" /> Move to Bottom
        </button>
      </li>
      <li class="separator"></li>
      <li>
        <button class="btn-danger" @click="close(); deleteEntry(index)">
          <font-awesome-icon icon="fa-solid fa-trash" /> Delete Entry
        </button>
      </li>
    </template>
  </Dropdown>
</template>

<style scoped>
</style>
