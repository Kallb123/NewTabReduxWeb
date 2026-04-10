<script setup lang="ts">
import type { panel, Preferences } from '@/types';
import { ref, watch } from 'vue';

const props = defineProps<{
  close: () => void;
  links: panel[];
  preferences: Preferences;
  setLinks: (updatedLinks: panel[]) => void;
  setPreferences: (updatedPreferences: Preferences) => void;
}>();

const linksJson = ref('');
const preferencesJson = ref('');

const parseLinksError = ref('');
const parsePreferencesError = ref('');

const save = () => {
  const parsedLinks = parseLinks(linksJson.value);
  const parsedPreferences = parsePreferences(preferencesJson.value);
  if (parsedLinks && parsedPreferences) {
    props.setLinks(parsedLinks);
    props.setPreferences(parsedPreferences);
    props.close();
  }
};

const parseLinks: (jsonString: string) => panel[] | null = (jsonString) => {
  try {
    const parsed: panel[] = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      parseLinksError.value = 'Expected an array for appData.links';
      return null;
    }
    parseLinksError.value = '';
    return parsed;
  } catch (error) {
    parseLinksError.value = 'Invalid JSON: ' + (error instanceof Error ? error.message : String(error));
    return null;
  }
}

const parsePreferences: (jsonString: string) => Preferences | null = (jsonString) => {
  try {
    const parsed: Preferences = JSON.parse(jsonString);
    if (!parsed.background || !parsed.style) {
      parsePreferencesError.value = 'Missing required fields in appData.preferences';
      return null;
    }
    parsePreferencesError.value = '';
    return parsed;
  } catch (error) {
    parsePreferencesError.value = 'Invalid JSON: ' + (error instanceof Error ? error.message : String(error));
    return null;
  }
}

watch(
  () => props.links,
  (value) => {
    try {
      linksJson.value = JSON.stringify(value, null, 2);
      parseLinksError.value = '';
    } catch {
      linksJson.value = '';
      parseLinksError.value = 'Cannot serialize links to JSON';
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.preferences,
  (value) => {
    try {
      preferencesJson.value = JSON.stringify(value, null, 2);
      parsePreferencesError.value = '';
    } catch {
      preferencesJson.value = '';
      parsePreferencesError.value = 'Cannot serialize preferences to JSON';
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => linksJson.value,
  (value) => {
    parseLinks(value);
  },
  { immediate: true, deep: true }
);

watch(
  () => preferencesJson.value,
  (value) => {
    parsePreferences(value);
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

      <label for="preferences-json">Edit preferences (JSON)</label>
      <textarea
        id="preferences-json"
        v-model="preferencesJson"
        rows="18"
        style="width: 100%; font-family: monospace;"
      ></textarea>

      <p v-if="parseLinksError" style="color: red; margin: 8px 0;">{{ parseLinksError }}</p>
      <p v-if="parsePreferencesError" style="color: red; margin: 8px 0;">{{ parsePreferencesError }}</p>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px;">
        <button type="button" @click="close">Cancel</button>
        <button type="button" @click="save">Save</button>
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
