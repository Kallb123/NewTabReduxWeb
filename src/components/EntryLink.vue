<script setup lang="ts">
import type { link } from './LinkPanel.vue';

defineProps<{
  link: link
}>()
</script>

<template>
  <a class="entry" :href="link.url" target="_blank">{{ link.title }}</a>
</template>

<style scoped>
</style>
