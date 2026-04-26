<script setup lang="ts">
import type { AppData, Preferences } from '@/types';
import { inject, ref } from 'vue';
import { migrateData } from '@/utils/migration';
import Dropdown from './Dropdown.vue';

const preferences = inject<Preferences>('preferences')!;

const { openSettings, openAbout, onExport, onImport } = defineProps<{
  openSettings: () => void
  openAbout: () => void
  onExport: () => void
  onImport: (data: AppData) => void
}>()

const fileInputRef = ref<HTMLInputElement>();
const importError = ref<string | null>(null);
const dropdownClose = ref<(() => void) | null>(null);

const themes = ['light', 'dark', 'system'] as const;

const toggleTheme = () => {
  const currentIndex = themes.indexOf(preferences.style.theme);
  const nextIndex = (currentIndex + 1) % themes.length;
  preferences.style.theme = themes[nextIndex] ?? "system";
};

const triggerImport = (close: () => void) => {
  importError.value = null;
  dropdownClose.value = close;
  fileInputRef.value?.click();
};

const triggerExport = (close: () => void) => {
  close();
  onExport();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (typeof reader.result !== 'string') {
        throw new Error('Could not read file contents');
      }
      const raw = JSON.parse(reader.result);
      const migrated = migrateData(raw);
      onImport(migrated);
      dropdownClose.value?.();
    } catch (e) {
      importError.value = e instanceof Error ? e.message : 'Failed to import file';
    } finally {
      // Reset file input so the same file can be re-selected if needed
      input.value = '';
    }
  };
  reader.readAsText(file);
};
</script>

<template>
  <header>
    <Dropdown>
      <template #trigger="{ open }">
        <button class="menuOpener" :aria-expanded="open" aria-haspopup="true" title="Menu">
          <font-awesome-icon icon="fa-solid fa-bars" />
        </button>
      </template>
      <template #default="{ close }">
        <li>
          <button @click="close(); openSettings()"><font-awesome-icon icon="fa-solid fa-cog" /> Settings</button>
        </li>
        <li>
          <button @click="toggleTheme" :title="`Current theme: ${preferences.style.theme}`">
            <font-awesome-icon v-if="preferences.style.theme === 'light'" icon="fa-regular fa-sun" />
            <font-awesome-icon v-else-if="preferences.style.theme === 'dark'" icon="fa-regular fa-moon" />
            <font-awesome-icon v-else icon="fa-solid fa-computer" /> Switch Theme
          </button>
        </li>
        <li>
          <button @click="triggerImport(close)"><font-awesome-icon icon="fa-solid fa-file-import" /> Import</button>
        </li>
        <li>
          <button @click="triggerExport(close)"><font-awesome-icon icon="fa-solid fa-file-export" /> Export</button>
        </li>
        <li>
          <button @click="close(); openAbout()"><font-awesome-icon icon="fa-solid fa-circle-info" /> About</button>
        </li>
      </template>
      <template #footer>
        <p v-if="importError" class="import-error">{{ importError }}</p>
      </template>
    </Dropdown>
    <input
      ref="fileInputRef"
      type="file"
      accept=".json,application/json"
      style="display: none"
      @change="handleFileChange"
    />
  </header>
</template>

<style scoped>
header {
  background-color: var(--color-background);
  display: flex;
  justify-content: flex-end;
  padding: 1em;
}

.menuOpener {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.5em;
}
</style>
