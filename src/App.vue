<script setup lang="ts">
import { reactive, onMounted, provide, watch } from 'vue';
import Background from './components/Background.vue';
import Header from './components/Header.vue';
import LinkSpace from './components/LinkSpace.vue';
import type { AppData } from './types';
import { defaultData } from './defaultData';

const appData = reactive<AppData>({ ...defaultData });

watch(appData, (newData) => {
  localStorage.setItem('newtabredux', JSON.stringify(newData));
}, { deep: true });

onMounted(() => {
  const stored = localStorage.getItem('newtabredux');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      Object.assign(appData, parsed);
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
  }
});

provide('preferences', appData.preferences);
</script>

<template>
  <div :class="{ 'link-buttons': appData.preferences.style.linkButtons }">
    <Background :background="appData.preferences.background"></Background>
    <Header></Header>
    <main>
      <LinkSpace :panels="appData.links" />
    </main>
  </div>
</template>

<style scoped>
</style>
