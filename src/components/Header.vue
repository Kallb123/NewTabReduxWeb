<script setup lang="ts">
import type { AppData, Preferences } from '@/types';
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { migrateData } from '@/utils/migration';

const preferences = inject<Preferences>('preferences')!;

const { openSettings, openAbout, onExport, onImport } = defineProps<{
  openSettings: () => void
  openAbout: () => void
  onExport: () => void
  onImport: (data: AppData) => void
}>()

const dropdownToggle = ref(false);
const wrapperRef = ref<HTMLElement>();
const fileInputRef = ref<HTMLInputElement>();
const importError = ref<string | null>(null);

const closeDropdown = () => {
  dropdownToggle.value = false;
};

const handleDocumentClick = (event: Event) => {
  // Close dropdown if click is outside the current entry element
  const target = event.target as HTMLElement;
  if (wrapperRef.value && !wrapperRef.value.contains(target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
});

const themes = ['light', 'dark', 'system'] as const;

const toggleTheme = () => {
  const currentIndex = themes.indexOf(preferences.style.theme);
  const nextIndex = (currentIndex + 1) % themes.length;
  preferences.style.theme = themes[nextIndex] ?? "system";
};

const triggerImport = () => {
  importError.value = null;
  fileInputRef.value?.click();
};

const triggerExport = () => {
  dropdownToggle.value = false;
  onExport();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const raw = JSON.parse(reader.result as string);
      const migrated = migrateData(raw);
      onImport(migrated);
      closeDropdown();
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
    <div ref="wrapperRef">
      <a class="menuOpener" href="#" @click.prevent="dropdownToggle = !dropdownToggle">
        <font-awesome-icon icon="fa-solid fa-bars" />
      </a>
      <div v-if="dropdownToggle" class="dropdown" @click.stop>
        <ul>
          <li>
            <a href="#" @click.stop.prevent="() => { dropdownToggle = false; openSettings(); }"><font-awesome-icon icon="fa-solid fa-cog" /> Settings</a>
          </li>
          <li>
            <a href="#" @click.prevent="toggleTheme" :title="`Current theme: ${preferences.style.theme}`">
              <font-awesome-icon v-if="preferences.style.theme === 'light'" icon="fa-regular fa-sun" />
              <font-awesome-icon v-else-if="preferences.style.theme === 'dark'" icon="fa-regular fa-moon" />
              <font-awesome-icon v-else icon="fa-solid fa-computer" /> Switch Theme
            </a>
          </li>
          <li>
            <a href="#" @click.stop.prevent="triggerImport"><font-awesome-icon icon="fa-solid fa-file-import" /> Import</a>
          </li>
          <li>
            <a href="#" @click.stop.prevent="triggerExport"><font-awesome-icon icon="fa-solid fa-file-export" /> Export</a>
          </li>
          <li>
            <a href="#" @click.stop.prevent="() => { dropdownToggle = false; openAbout(); }"><font-awesome-icon icon="fa-solid fa-circle-info" /> About</a>
          </li>
        </ul>
        <p v-if="importError" class="import-error">{{ importError }}</p>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        accept=".json,application/json"
        style="display: none"
        @change="handleFileChange"
      />
    </div>
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
  padding: 0.5em;
}

.dropdown {
  background: var(--color-background-soft);
  border: var(--color-border) solid 1px;
  border-radius: 3px;
  right: 0;
  margin: 0.5em 0.5em 0;
  position: absolute;
  top: 2em;
  z-index: 10;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

li {
  list-style: none;
}

.dropdown a, .dropdown button {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  display: block;
  padding: 0.75em 1.5em;
  text-align: left;
  width: 100%;
}

a:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.import-error {
  color: var(--color-danger, #c00);
  font-size: 0.85em;
  margin: 0;
  padding: 0.5em 1.5em;
}
</style>
