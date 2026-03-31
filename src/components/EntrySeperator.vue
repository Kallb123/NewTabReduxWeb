<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="separator"></div>
  <div class="title" v-if="title">{{ title }}</div>
</template>

<style scoped>
.separator {
  border-top: var(--color-border) solid 1px;
  margin: 0.5em 0;
}

.title {
  font-weight: semi-bold;
  text-align: center;
}
</style>
