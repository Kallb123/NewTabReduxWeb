<script setup lang="ts">
import type { Preferences } from '@/types';
import { inject } from 'vue';

const preferences = inject<Preferences>('preferences')!;

const themes = ['light', 'dark', 'system'] as const;

const toggleTheme = () => {
  const currentIndex = themes.indexOf(preferences.style.theme);
  const nextIndex = (currentIndex + 1) % themes.length;
  preferences.style.theme = themes[nextIndex] ?? "system";
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
