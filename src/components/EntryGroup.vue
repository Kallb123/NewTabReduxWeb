<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from 'vue';
import EntryLink from './EntryLink.vue';
import EntrySeperator from './EntrySeperator.vue';
import type { linkGroup, Preferences } from '@/types';

const dropdownToggle = ref(false);
const entryRef = ref<HTMLElement>();

defineProps<{
  group: linkGroup
}>()

const closeDropdown = () => {
  dropdownToggle.value = false;
};

const handleDocumentClick = (event: Event) => {
  // Close dropdown if click is outside the current entry element
  const target = event.target as HTMLElement;
  if (entryRef.value && !entryRef.value.contains(target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
});
</script>

<template>
  <div ref="entryRef" class="entryWrapper">
    <EntryLink :link="{ url: '#', title: group.title, favicon: group.favicon }" :group="true" @click.prevent="dropdownToggle = !dropdownToggle" />
    <div v-if="dropdownToggle" class="dropdown" @click.stop>
      <div v-for="(entry, index) in group.links" :key="index">
        <EntrySeperator v-if="typeof entry === 'string'" :title="entry" />
        <EntryLink v-else :link="entry" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.entryWrapper {
  position: relative;
}

.dropdown {
  background: var(--color-background-soft);
  border: var(--color-border) solid 1px;
  border-radius: 3px;
  left: 0;
  margin: 0.5em 0.5em 0;
  position: absolute;
  top: 2em;
  z-index: 10;
}
</style>
