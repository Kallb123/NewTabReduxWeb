<script setup lang="ts">
import { ref } from 'vue';
import type { panel } from '@/types';

const props = defineProps<{
  panel: panel;
  close: () => void;
}>();

const titleInput = ref(props.panel.title);

const save = () => {
  props.panel.title = titleInput.value.trim() || props.panel.title;
  props.close();
};
</script>

<template>
  <div class="overlay" @click="close">
    <div class="settingsPanel" @click.stop>
      <div class="field">
        <input
          id="panel-title"
          v-model="titleInput"
          placeholder="Panel Title"
          type="text"
          @keydown.enter="save"
          @keydown.escape="close"
          autofocus
        />
      </div>

      <div class="actions">
        <button type="button" @click="close">Cancel</button>
        <button type="button" @click="save">Save</button>
      </div>
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
  z-index: 100;
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
  width: 24em;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.field input {
  background: var(--color-background-soft);
  border: var(--color-border) solid 1px;
  border-radius: 3px;
  color: var(--color-text);
  font-size: 1em;
  padding: 0.4em 0.6em;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
</style>
