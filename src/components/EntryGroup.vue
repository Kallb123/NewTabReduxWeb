<script setup lang="ts">
import { ref } from 'vue';
import EntryLink from './EntryLink.vue';
import EntrySeperator from './EntrySeperator.vue';
import type { linkGroup } from '@/types';

const dropdownToggle = ref(false);

defineProps<{
  group: linkGroup
}>()
</script>

<template>
  <a class="entry" href="#" @click="dropdownToggle = !dropdownToggle">
    {{ group.title }} <span class="caret"></span>
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
}

.link {
  border: var(--color-border) solid 1px;
  border-radius: 3px;
  color: var(--color-text);
  display: block;
  margin: 0.5em 0.5em 0;
  padding: 0.5em 1em;
  text-align: center;
  text-decoration: none;
}

.link:last-child {
  margin-bottom: 0.5em;
}
</style>
