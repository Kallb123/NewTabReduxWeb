<script setup lang="ts">
import type { link, Preferences } from '@/types';
import { extractHostname } from '@/utils/favicons';
import { computed, inject } from 'vue';

const faviconUrl = computed(() => {
  if (!preferences.style.favicons) return "";
  if (link.favicon) return link.favicon;
  if (group) return "";
  let domain = extractHostname(link.url);
  return `https://www.google.com/s2/favicons?domain=${domain}`;
});

const preferences = inject<Preferences>('preferences')!;

const { link, group } = defineProps<{
  link: link
  group?: boolean
}>()

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.visibility = 'hidden';
};
</script>

<template>
  <a class="entry" :href="link.url" target="_blank">
    <img v-if="preferences.style.favicons && faviconUrl" :src="faviconUrl" :alt="link.title" class="favicon" height="16" width="16" @error="handleImageError" />
    <span>{{ link.title }} <span v-if="group" class="caret"></span></span>
  </a>
</template>

<style scoped>
.entry {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

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

.favicon {
  height: 16px;
  margin-right: 0.5em;
  width: 16px;
}

.entry > span {
  flex-grow: 1;
}
</style>
