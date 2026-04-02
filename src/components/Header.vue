<script setup lang="ts">
import type { Preferences } from '@/types';
import { inject } from 'vue';

const preferences = inject<Preferences>('preferences')!;
const setTheme = inject<(theme: 'light' | 'dark' | 'system') => void>('setTheme')!;

const themes = ['light', 'dark', 'system'] as const;

const toggleTheme = () => {
  const currentIndex = themes.indexOf(preferences.style.theme);
  console.log(`Current theme: ${preferences.style.theme}, index: ${currentIndex}`);
  const nextIndex = (currentIndex + 1) % themes.length;
  console.log(`Next theme: ${themes[nextIndex]}, index: ${nextIndex}`);
  setTheme(themes[nextIndex] ?? "system");
};
</script>

<template>
  <header>
    <div>Time</div>
    <div class="settings">
      <button @click="toggleTheme" :title="`Current theme: ${preferences.style.theme}`">
        {{ preferences.style.theme === 'light' ? '☀️' : preferences.style.theme === 'dark' ? '🌙' : '⚙️' }}
      </button>
      <span>Settings</span>
    </div>
  </header>
</template>

<style scoped>
header {
  background-color: var(--color-background);
}
</style>
