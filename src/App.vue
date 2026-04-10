<script setup lang="ts">
import { reactive, onMounted, provide, watch, ref } from 'vue';
import Background from './components/Background.vue';
import Header from './components/Header.vue';
import LinkSpace from './components/LinkSpace.vue';
import type { AppData, panel, Preferences } from './types';
import { defaultData } from './defaultData';
import Settings from './components/Settings.vue';
import About from './components/About.vue';

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

watch(() => appData.preferences.style.pageTitle, (title) => {
  document.title = title || 'New Tab';
}, { immediate: true });

onMounted(() => {
  const stored = localStorage.getItem('newtabredux');
  if (stored) {
    try {
      const parsed: AppData = JSON.parse(stored);
      appData.links = parsed.links;
      appData.preferences.background = { ...appData.preferences.background, ...parsed.preferences?.background };
      appData.preferences.style = { ...appData.preferences.style, ...parsed.preferences?.style };
      appData.preferences.inlineEditing = parsed.preferences?.inlineEditing ?? appData.preferences.inlineEditing;
      appData.preferences.dragAndDrop = parsed.preferences?.dragAndDrop ?? appData.preferences.dragAndDrop;
      appData.preferences.middleClick = parsed.preferences?.middleClick ?? appData.preferences.middleClick;
      console.log('AppData restored from localStorage:', appData);
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
  }
  console.log('AppData being used:', appData);
  applyTheme();
});

const settingsOpen = ref(false);
const aboutOpen = ref(false);

const movePanel = (index: number, direction: 'start' | 'left' | 'right' | 'end') => {
  const links = appData.links;
  const last = links.length - 1;
  let target: number;
  if (direction === 'start') target = 0;
  else if (direction === 'left') target = Math.max(0, index - 1);
  else if (direction === 'right') target = Math.min(last, index + 1);
  else target = last;
  if (target === index) return;
  const removed = links.splice(index, 1);
  if (removed[0] === undefined) return;
  links.splice(target, 0, removed[0]);
};

const addPanelBefore = (index: number) => {
  if (index < 0 || index > appData.links.length) return;
  appData.links.splice(index, 0, { title: 'New Panel', entries: [] });
};

const addPanelAfter = (index: number) => {
  if (index < 0 || index >= appData.links.length) return;
  appData.links.splice(index + 1, 0, { title: 'New Panel', entries: [] });
};

const duplicatePanel = (index: number) => {
  const source = appData.links[index];
  if (source === undefined) return;
  appData.links.splice(index + 1, 0, JSON.parse(JSON.stringify(source)));
};

const deletePanel = (index: number) => {
  if (appData.links.length <= 1) return;
  appData.links.splice(index, 1);
};

provide('preferences', appData.preferences);
</script>

<template>
  <div :class="{ 'link-buttons': appData.preferences.style.linkButtons }">
    <Background :background="appData.preferences.background" @update:lastImage="(v) => appData.preferences.background.lastImage = v"></Background>
    <Header :openSettings="() => settingsOpen = true" :openAbout="() => aboutOpen = true"></Header>
    <main :class="{ 'fluid-width': appData.preferences.style.fluidWidth }">
      <LinkSpace :panels="appData.links" :movePanel="movePanel" :addPanelBefore="addPanelBefore" :addPanelAfter="addPanelAfter" :duplicatePanel="duplicatePanel" :deletePanel="deletePanel" />
    </main>
    <Settings
      v-if="settingsOpen"
      :links="appData.links"
      :preferences="appData.preferences"
      :setLinks="(newLinks: panel[]) => { appData.links = newLinks }"
      :setPreferences="(newPreferences: Preferences) => { Object.assign(appData.preferences, newPreferences) }"
      :close="() => settingsOpen = false"
    />
    <About
      v-if="aboutOpen"
      :close="() => aboutOpen = false"
    />
  </div>
</template>

<style scoped>
main {
  margin: 0 auto;
  max-width: 960px;
}

main.fluid-width {
  max-width: none;
}
</style>
