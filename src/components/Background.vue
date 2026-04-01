<script setup lang="ts">
import { computed } from 'vue';
  
const { background } = defineProps<{
  background: string
}>()

const backgroundStyle = computed(() => ({
  background: `url(${background}) repeat center center fixed`,
  position: 'fixed' as const,
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  zIndex: -1,
}));
</script>

<template>
  <div class="background" :style="backgroundStyle"></div>
</template>
