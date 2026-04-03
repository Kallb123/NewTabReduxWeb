<script setup lang="ts">
import type { Preferences } from '@/types';
import { inject, onMounted, onUnmounted, ref } from 'vue';

const preferences = inject<Preferences>('preferences')!;

const { openSettings } = defineProps<{
  openSettings: () => void
}>()

const dropdownToggle = ref(false);
const wrapperRef = ref<HTMLElement>();

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
</script>

<template>
  <header>
    <div ref="wrapperRef">
      <a class="menuOpener" href="#" @click.prevent="dropdownToggle = !dropdownToggle">Menu</a>
      <div v-if="dropdownToggle" class="dropdown" @click.stop>
        <ul>
          <li>
            <a href="#" @click.stop="() => { dropdownToggle = false; openSettings(); }">⚙️ Settings</a>
          </li>
          <li>
            <a href="#" @click.prevent="toggleTheme" :title="`Current theme: ${preferences.style.theme}`">
              {{ preferences.style.theme === 'light' ? '☀️' : preferences.style.theme === 'dark' ? '🌙' : '⚙️' }} Switch Theme
            </a>
          </li>
          <li>Import</li>
          <li>Export</li>
        </ul>
        <
      </div>
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
</style>
