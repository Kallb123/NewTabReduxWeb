<script setup lang="ts">
import type { panel } from '@/types';
import LinkPanel from './LinkPanel.vue';

defineProps<{
  panels: panel[]
  movePanel: (index: number, direction: 'start' | 'left' | 'right' | 'end') => void
  addPanelBefore: (index: number) => void
  addPanelAfter: (index: number) => void
  duplicatePanel: (index: number) => void
  deletePanel: (index: number) => void
}>()

</script>

<template>
  <div id="links">
    <LinkPanel
      v-for="(panel, index) in panels"
      :key="panel.title"
      :panel="panel"
      :panelIndex="index"
      :totalPanels="panels.length"
      :movePanel="movePanel"
      :addPanelBefore="addPanelBefore"
      :addPanelAfter="addPanelAfter"
      :duplicatePanel="duplicatePanel"
      :deletePanel="deletePanel"
    />
  </div>
</template>

<style scoped>
#links {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  padding: 15px;
}

@media (min-width: 500px) {
  #links {
    grid-gap: 15px;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (min-width: 768px) {
  #links {
    grid-gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}
</style>
