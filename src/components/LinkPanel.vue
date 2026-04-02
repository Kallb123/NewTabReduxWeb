<script setup lang="ts">
import EntryLink from './EntryLink.vue';
import EntryGroup from './EntryGroup.vue';
import EntrySeperator from './EntrySeperator.vue';
import type { panel } from '@/types';

defineProps<{
  panel: panel
}>()
</script>

<template>
  <div class="panelWrapper">
    <div class="panel">
      <header class="panel-heading">{{ panel.title }}</header>
      <div class="panel-body">
        <div v-for="(entry, index) in panel.entries" :key="index">
          <EntrySeperator v-if="typeof entry === 'string'" :title="entry" />
          <EntryGroup v-else-if="'links' in entry" :group="entry" />
          <EntryLink v-else :link="entry" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  background: var(--color-background);
  border: var(--color-border) solid 1px;
  border-radius: 3px;
}
.panel header {
  background: var(--color-background-soft);
  border-bottom: var(--color-border) solid 1px;
  padding: 0.5em 1em;
}
</style>
