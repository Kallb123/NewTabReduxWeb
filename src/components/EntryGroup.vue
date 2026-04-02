<script setup lang="ts">
import { inject, ref } from 'vue';
import EntryLink from './EntryLink.vue';
import EntrySeperator from './EntrySeperator.vue';
import type { linkGroup, Preferences } from '@/types';

const dropdownToggle = ref(false);
const preferences = inject<Preferences>('preferences')!;

defineProps<{
  group: linkGroup
}>()

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.visibility = 'hidden';
};
</script>

<template>
  <a class="entry" href="#" @click="dropdownToggle = !dropdownToggle">
    <img v-if="preferences.style.favicons && group.favicon" :src="group.favicon" :alt="group.title" class="favicon" height="16" width="16" @error="handleImageError" />
    <span>{{ group.title }} <span class="caret"></span></span>
    <div v-if="dropdownToggle" class="dropdown" @click.stop>
      <div v-for="(entry, index) in group.links" :key="index">
        <EntrySeperator v-if="typeof entry === 'string'" :title="entry" />
        <EntryLink v-else :link="entry" />
      </div>
    </div>
  </a>
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

.entry {
  position: relative;
}

.dropdown {
  background: var(--color-background-soft);
  border: var(--color-border) solid 1px;
  border-radius: 3px;
  left: 0;
  margin: 0.5em 0.5em 0;
  position: absolute;
  z-index: 10;
}
</style>
