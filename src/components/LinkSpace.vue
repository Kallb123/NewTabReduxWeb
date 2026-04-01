<script setup lang="ts">
import LinkPanel, { type panel } from './LinkPanel.vue';

defineProps<{
  panels: panel[]
}>()

</script>

<template>
  <div id="links">
    <LinkPanel v-for="panel in panels" :key="panel.title" :panel="panel" />
  </div>
</template>

<style scoped>
#links {
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  padding: 15px;
}
</style>
