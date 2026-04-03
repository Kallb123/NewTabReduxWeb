<script setup lang="ts">
import type { panel } from '@/types';
import { ref, watch } from 'vue';

const props = defineProps<{
  close: () => void;
  links: panel[];
  setLinks: (updatedLinks: panel[]) => void;
}>();

const linksJson = ref('');
const parseError = ref('');

const applyLinks = () => {
  const parsed = parse(linksJson.value)
  if (parsed) {
    props.setLinks(parsed);
    props.close();
  }
};

const parse: (jsonString: string) => panel[] | null = (jsonString) => {
  try {
    const parsed: panel[] = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      parseError.value = 'Expected an array for appData.links';
      return null;
    }
    parseError.value = '';
    return parsed;
  } catch (error) {
    parseError.value = 'Invalid JSON: ' + (error instanceof Error ? error.message : String(error));
    return null;
  }
}

watch(
  () => props.links,
  (value) => {
    try {
      linksJson.value = JSON.stringify(value, null, 2);
      parseError.value = '';
    } catch {
      linksJson.value = '';
      parseError.value = 'Cannot serialize links to JSON';
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => linksJson.value,
  (value) => {
    parse(value);
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="overlay" @click="close">
    <div class="settingsPanel" @click.stop>
      <h2>Settings</h2>

      <label for="links-json">Edit links (JSON)</label>
      <textarea
        id="links-json"
        v-model="linksJson"
        rows="18"
        style="width: 100%; font-family: monospace;"
      ></textarea>

      <p v-if="parseError" style="color: red; margin: 8px 0;">{{ parseError }}</p>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px;">
        <button type="button" @click="close">Cancel</button>
        <button type="button" @click="applyLinks">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.settingsPanel {
  background: var(--color-background);
  border: var(--color-border) solid 1px;
  border-radius: 8px;
  padding: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50em;
}
</style>
