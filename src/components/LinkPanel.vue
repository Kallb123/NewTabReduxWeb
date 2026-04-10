<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue';
import EntryLink from './EntryLink.vue';
import EntryGroup from './EntryGroup.vue';
import EntrySeperator from './EntrySeperator.vue';
import PanelSettings from './PanelSettings.vue';
import type { panel, Preferences } from '@/types';

const props = defineProps<{
  panel: panel
  panelIndex: number
  totalPanels: number
  movePanel: (index: number, direction: 'start' | 'left' | 'right' | 'end') => void
  addPanelBefore: (index: number) => void
  addPanelAfter: (index: number) => void
  duplicatePanel: (index: number) => void
  deletePanel: (index: number) => void
}>()

const dropdownOpen = ref(false);
const settingsOpen = ref(false);
const wrapperRef = ref<HTMLElement>();

const handleDocumentClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (wrapperRef.value && !wrapperRef.value.contains(target)) {
    dropdownOpen.value = false;
  }
};

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    dropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleDocumentKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleDocumentKeydown);
});

const move = (direction: 'start' | 'left' | 'right' | 'end') => {
  dropdownOpen.value = false;
  props.movePanel(props.panelIndex, direction);
};

const addBefore = () => {
  dropdownOpen.value = false;
  props.addPanelBefore(props.panelIndex);
};

const addAfter = () => {
  dropdownOpen.value = false;
  props.addPanelAfter(props.panelIndex);
};

const duplicate = () => {
  dropdownOpen.value = false;
  props.duplicatePanel(props.panelIndex);
};

const deleteSelf = () => {
  if (confirm(`Are you sure you want to delete the panel "${props.panel.title}"? This action cannot be undone.`)) {
    dropdownOpen.value = false;
    props.deletePanel(props.panelIndex);
  }
};

const preferences = inject('preferences') as Preferences;
</script>

<template>
  <div class="panelWrapper">
    <div class="panel">
      <header class="panel-heading">
        <span class="panel-title">{{ panel.title }}</span>
        <div v-if="preferences.inlineEditing" ref="wrapperRef" class="panel-move">
          <button class="move-btn" @click.stop="dropdownOpen = !dropdownOpen" :aria-expanded="dropdownOpen" aria-haspopup="true" title="Move panel">
            <font-awesome-icon icon="fa-solid fa-chevron-down" />
          </button>
          <div v-if="dropdownOpen" class="move-dropdown" @click.stop>
            <ul>
              <li>
                <button :disabled="panelIndex === 0" @click="move('start')">
                  <font-awesome-icon icon="fa-solid fa-angles-left" /> Move to Start
                </button>
              </li>
              <li>
                <button :disabled="panelIndex === 0" @click="move('left')">
                  <font-awesome-icon icon="fa-solid fa-angle-left" /> Move Left
                </button>
              </li>
              <li>
                <button :disabled="panelIndex === totalPanels - 1" @click="move('right')">
                  <font-awesome-icon icon="fa-solid fa-angle-right" /> Move Right
                </button>
              </li>
              <li>
                <button :disabled="panelIndex === totalPanels - 1" @click="move('end')">
                  <font-awesome-icon icon="fa-solid fa-angles-right" /> Move to End
                </button>
              </li>
              <li class="separator"></li>
              <li>
                <button @click="dropdownOpen = false; settingsOpen = true">
                  <font-awesome-icon icon="fa-solid fa-pencil" /> Edit Panel
                </button>
              </li>
              <li class="separator"></li>
              <li>
                <button @click="addBefore">
                  <font-awesome-icon icon="fa-solid fa-plus" /> Add Panel Before
                </button>
              </li>
              <li>
                <button @click="addAfter">
                  <font-awesome-icon icon="fa-solid fa-plus" /> Add Panel After
                </button>
              </li>
              <li>
                <button @click="duplicate">
                  <font-awesome-icon icon="fa-solid fa-copy" /> Duplicate Panel
                </button>
              </li>
              <li class="separator"></li>
              <li>
                <button class="btn-danger" :disabled="totalPanels <= 1" @click="deleteSelf">
                  <font-awesome-icon icon="fa-solid fa-trash" /> Delete Panel
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>
      <PanelSettings
        v-if="settingsOpen"
        :panel="panel"
        :close="() => settingsOpen = false"
      />
      <div class="panel-body">
        <div v-for="(entry, index) in panel.entries" :key="index">
          <EntrySeperator v-if="typeof entry === 'string'" :title="entry" />
          <EntryGroup v-else-if="'links' in entry" :group="entry" />
          <EntryLink v-else :link="entry" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  background: var(--color-background);
  border: var(--color-border) solid 1px;
  border-radius: 3px;
}
.panel header {
  background: var(--color-background-soft);
  border-bottom: var(--color-border) solid 1px;
  padding: 0.5em 1em;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.panel-title {
  flex: 1;
}
.panel-move {
  position: relative;
}
.move-btn {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.25em 0.5em;
  border-radius: 3px;
  line-height: 1;
  visibility: hidden;
}
.move-btn:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}
.panel-heading:hover .move-btn {
  visibility: visible;
}
.move-dropdown {
  background: var(--color-background-soft);
  border: var(--color-border) solid 1px;
  border-radius: 3px;
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 10;
  min-width: 160px;
}
.move-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.move-dropdown li {
  list-style: none;
}
.move-dropdown button {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  display: block;
  padding: 0.75em 1em;
  text-align: left;
  width: 100%;
  white-space: nowrap;
}
.move-dropdown button:hover:not(:disabled) {
  background-color: hsla(160, 100%, 37%, 0.2);
}
.move-dropdown button:disabled {
  color: var(--color-border);
  cursor: default;
}
.move-dropdown li.separator {
  border-top: var(--color-border) solid 1px;
  margin: 0.25em 0;
}
.move-dropdown button.btn-danger {
  color: #c0392b;
}
.move-dropdown button.btn-danger:hover {
  background-color: hsla(5, 60%, 50%, 0.15);
}
</style>

