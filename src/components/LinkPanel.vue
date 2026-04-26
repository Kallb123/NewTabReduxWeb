<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue';
import EntryLink from './EntryLink.vue';
import EntryGroup from './EntryGroup.vue';
import EntrySeperator from './EntrySeperator.vue';
import PanelSettings from './PanelSettings.vue';
import Dropdown from './Dropdown.vue';
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

const settingsOpen = ref(false);
const wrapperRef = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();

const resizeGridItem = () => {
  const wrapper = wrapperRef.value;
  const panel = panelRef.value;
  const grid = wrapper?.parentElement;
  if (!wrapper || !panel || !grid) return;
  const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
  const rowSpan = Math.ceil((panel.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
  wrapper.style.gridRowEnd = `span ${rowSpan}`;
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeObserver = new ResizeObserver(resizeGridItem);
  if (panelRef.value) resizeObserver.observe(panelRef.value);
  resizeGridItem();
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

const deleteSelf = (close: () => void) => {
  if (confirm(`Are you sure you want to delete the panel "${props.panel.title}"? This action cannot be undone.`)) {
    close();
    props.deletePanel(props.panelIndex);
  }
};

const preferences = inject('preferences') as Preferences;
</script>

<template>
  <div ref="wrapperRef" class="panelWrapper">
    <div ref="panelRef" class="panel">
      <header class="panel-heading">
        <span class="panel-title">{{ panel.title }}</span>
        <div v-if="preferences.inlineEditing">
          <Dropdown>
            <template #trigger="{ open }">
              <button class="move-btn" :aria-expanded="open" aria-haspopup="true" title="Move panel">
                <font-awesome-icon icon="fa-solid fa-chevron-down" />
              </button>
            </template>
            <template #default="{ close }">
              <li>
                <button :disabled="panelIndex === 0" @click="close(); movePanel(panelIndex, 'start')">
                  <font-awesome-icon icon="fa-solid fa-angles-left" /> Move to Start
                </button>
              </li>
              <li>
                <button :disabled="panelIndex === 0" @click="close(); movePanel(panelIndex, 'left')">
                  <font-awesome-icon icon="fa-solid fa-angle-left" /> Move Left
                </button>
              </li>
              <li>
                <button :disabled="panelIndex === totalPanels - 1" @click="close(); movePanel(panelIndex, 'right')">
                  <font-awesome-icon icon="fa-solid fa-angle-right" /> Move Right
                </button>
              </li>
              <li>
                <button :disabled="panelIndex === totalPanels - 1" @click="close(); movePanel(panelIndex, 'end')">
                  <font-awesome-icon icon="fa-solid fa-angles-right" /> Move to End
                </button>
              </li>
              <li class="separator"></li>
              <li>
                <button @click="close(); settingsOpen = true">
                  <font-awesome-icon icon="fa-solid fa-pencil" /> Edit Panel
                </button>
              </li>
              <li class="separator"></li>
              <li>
                <button @click="close(); addPanelBefore(panelIndex)">
                  <font-awesome-icon icon="fa-solid fa-plus" /> Add Panel Before
                </button>
              </li>
              <li>
                <button @click="close(); addPanelAfter(panelIndex)">
                  <font-awesome-icon icon="fa-solid fa-plus" /> Add Panel After
                </button>
              </li>
              <li>
                <button @click="close(); duplicatePanel(panelIndex)">
                  <font-awesome-icon icon="fa-solid fa-copy" /> Duplicate Panel
                </button>
              </li>
              <li class="separator"></li>
              <li>
                <button class="btn-danger" :disabled="totalPanels <= 1" @click="deleteSelf(close)">
                  <font-awesome-icon icon="fa-solid fa-trash" /> Delete Panel
                </button>
              </li>
            </template>
          </Dropdown>
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
</style>

