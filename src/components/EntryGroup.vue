<script setup lang="ts">
import EntryLink from './EntryLink.vue';
import EntrySeperator from './EntrySeperator.vue';
import Dropdown from './Dropdown.vue';
import type { linkGroup } from '@/types';

defineProps<{
  group: linkGroup
}>()
</script>

<template>
  <div class="entryWrapper">
    <Dropdown>
      <template #trigger>
        <EntryLink :link="{ url: '#', title: group.title, favicon: group.favicon }" :group="true" />
      </template>
      <template #default>
        <li v-for="(entry, index) in group.links" :key="index" :class="{ separator: typeof entry === 'string' }">
          <EntrySeperator v-if="typeof entry === 'string'" :title="entry" />
          <EntryLink v-else :link="entry" />
        </li>
      </template>
    </Dropdown>
  </div>
</template>

<style scoped>
.entryWrapper {
  position: relative;
}
</style>
