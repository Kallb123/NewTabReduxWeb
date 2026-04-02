<script setup lang="ts">
import { inject, ref, onMounted, onUnmounted } from 'vue';
import EntryLink from './EntryLink.vue';
import EntrySeperator from './EntrySeperator.vue';
import type { linkGroup, Preferences } from '@/types';

const dropdownToggle = ref(false);
const entryRef = ref<HTMLElement>();
const preferences = inject<Preferences>('preferences')!;

defineProps<{
  group: linkGroup
}>()

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.visibility = 'hidden';
};

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
  <div class="entryWrapper">
    <a ref="entryRef" class="entry" href="#" @click.prevent="dropdownToggle = !dropdownToggle">
      <img v-if="preferences.style.favicons && group.favicon" :src="group.favicon" :alt="group.title" class="favicon" height="16" width="16" @error="handleImageError" />
      <span>{{ group.title }} <span class="caret"></span></span>
    </a>
    <div v-if="dropdownToggle" class="dropdown" @click.stop>
      <div v-for="(entry, index) in group.links" :key="index">
        <EntrySeperator v-if="typeof entry === 'string'" :title="entry" />
        <EntryLink v-else :link="entry" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.caret {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 2px;
  vertical-align: middle;
  border-top: 4px dashed;
  border-top: 4px solid\9;
  border-right: 4px solid transparent;
  border-left: 4px solid transparent;
}

.entryWrapper {
  position: relative;
}

.entry {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.favicon {
  height: 16px;
  margin-right: 4px;
  width: 16px;
}

.entry > span {
  flex-grow: 1;
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
