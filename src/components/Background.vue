<script setup lang="ts">
</script>

<template>
  <div class="background"></div>
</template>

<style scoped>
.background {
  background: url('/bg.png') repeat center center fixed;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Ensure it stays behind other content */
}
</style>
