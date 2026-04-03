<script setup lang="ts">
import { reactive, onMounted, provide, watch, ref } from 'vue';
import Background from './components/Background.vue';
import Header from './components/Header.vue';
import LinkSpace from './components/LinkSpace.vue';
import type { AppData, panel } from './types';
import { defaultData } from './defaultData';
import Settings from './components/Settings.vue';

const appData = reactive<AppData>({ ...defaultData });
console.log('AppData initialized:', appData);

const applyTheme = () => {
  const theme = appData.preferences.style.theme;
  const html = document.documentElement;
  
  html.classList.remove('light-theme', 'dark-theme', 'system-theme');
  html.classList.add(`${theme}-theme`);
  
  if (theme === 'system') {
    html.style.colorScheme = 'light dark';
  } else {
    html.style.colorScheme = theme;
  }
};

watch(appData, (newData) => {
  localStorage.setItem('newtabredux', JSON.stringify(newData));
  console.log('AppData updated and saved to localStorage:', newData);
}, { deep: true });

watch(() => appData.preferences.style.theme, applyTheme, { flush: 'sync' });

onMounted(() => {
  const stored = localStorage.getItem('newtabredux');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      appData.links = parsed.links;
      Object.assign(appData.preferences, parsed.preferences);
      console.log('AppData restored from localStorage:', appData);
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
  }
  console.log('AppData being used:', appData);
  applyTheme();
});

const settingsOpen = ref(false);

provide('preferences', appData.preferences);
</script>

<template>
  <div :class="{ 'link-buttons': appData.preferences.style.linkButtons }">
    <Background :background="appData.preferences.background"></Background>
    <Header :openSettings="() => settingsOpen = true"></Header>
    <main>
      <LinkSpace :panels="appData.links" />
    </main>
    <Settings
      v-if="settingsOpen"
      :links="appData.links"
      :setLinks="(newLinks: panel[]) => { appData.links = newLinks }"
      :close="() => settingsOpen = false"
    />
  </div>
</template>

<style scoped>
</style>
