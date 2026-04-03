<script setup lang="ts">
defineProps<{
  close: () => void
}>()
</script>

<template>
  <div class="overlay" @click="close">
    <div class="settingsPanel" @click.stop>
      <h2>Settings</h2>
      <!-- Add your settings content here -->
    </div>
  </div>
</template>

<style scoped>
.overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.settingsPanel {
  background: var(--color-background);
  border: var(--color-border) solid 1px;
  border-radius: 8px;
  padding: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
