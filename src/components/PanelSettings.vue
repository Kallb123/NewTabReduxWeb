<script setup lang="ts">
import { ref } from 'vue';
import type { link, linkGroup, panel } from '@/types';
import Dropdown from './Dropdown.vue';
import PanelSettingsEntryDropdown from './PanelSettingsEntryDropdown.vue';

const props = defineProps<{
  panel: panel;
  close: () => void;
}>();

const panelDupe = ref(JSON.parse(JSON.stringify(props.panel)) as panel);

const save = () => {
  props.panel.title = panelDupe.value.title.trim() || props.panel.title;
  props.panel.entries = panelDupe.value.entries;
  props.close();
};

const moveEntry = (index: number, direction: 'top' | 'up' | 'down' | 'bottom') => {
  const entries = panelDupe.value.entries;
  const [entry] = entries.splice(index, 1);
  if (!entry) return;
  if (direction === 'top') entries.unshift(entry);
  else if (direction === 'up') entries.splice(index - 1, 0, entry);
  else if (direction === 'down') entries.splice(index + 1, 0, entry);
  else entries.push(entry);
};

const deleteEntry = (index: number) => {
  if (confirm('Are you sure you want to delete this entry?')) {
    panelDupe.value.entries.splice(index, 1);
  }
};
</script>

<template>
  <div class="overlay" @click="close">
    <div class="settingsPanel" @click.stop>
      <div class="modalHeader">
        <div class="field">
          <input
            id="panel-title"
            v-model="panelDupe.title"
            placeholder="Panel Title"
            type="text"
            @keydown.enter="save"
            @keydown.escape="close"
            autofocus
          />
        </div>
      </div>
      <div v-for="(entry, index) in panelDupe.entries" :key="index" class="entryWrapper">
        <div v-if="typeof entry === 'string'" class="field">
          <div class="entryTitleRow">
            <PanelSettingsEntryDropdown
              :index="index"
              :length="panelDupe.entries.length"
              :moveEntry="moveEntry"
              :deleteEntry="deleteEntry"
            />
            <input
              v-model="panelDupe.entries[index]"
              placeholder="Separator Title"
              title="Separator Title"
              type="text"
              @keydown.enter="save"
              @keydown.escape="close"
            />
          </div>
        </div>
        <div v-else-if="'links' in entry" class="field">
          <!-- TODO: Be able to edit the title used for the group and favicon, as well as the links inside -->
          <div class="entryTitleRow">
            <PanelSettingsEntryDropdown
              :index="index"
              :length="panelDupe.entries.length"
              :moveEntry="moveEntry"
              :deleteEntry="deleteEntry"
            />
            <input
              v-model="(panelDupe.entries[index] as linkGroup).title"
              placeholder="Link Group Title"
              title="Link Group Title"
              type="text"
              @keydown.enter="save"
              @keydown.escape="close"
            />
          </div>
          <input
            v-model="(panelDupe.entries[index] as linkGroup).favicon"
            placeholder="Link Group Favicon URL (optional)"
            title="Link Group Favicon URL (optional)"
            type="text"
            @keydown.enter="save"
            @keydown.escape="close"
          />
          <div v-for="(groupEntry, groupIndex) in (panelDupe.entries[index] as linkGroup).links" :key="groupIndex" class="field">
            <div v-if="typeof groupEntry === 'string'" class="field entryGroupWrapper">
              <input
                v-model="((panelDupe.entries[index] as linkGroup).links[groupIndex] as string)"
                placeholder="Separator Title"
                title="Separator Title"
                type="text"
                @keydown.enter="save"
                @keydown.escape="close"
              />
            </div>
            <div v-else class="entryGroupWrapper"> 
              <input
                v-model="((panelDupe.entries[index] as linkGroup).links[groupIndex] as link).title"
                placeholder="Link Title"
                title="Link Title"
                type="text"
                @keydown.enter="save"
                @keydown.escape="close"
              />
              <input
                v-model="((panelDupe.entries[index] as linkGroup).links[groupIndex] as link).url"
                placeholder="Link URL"
                title="Link URL"
                type="text"
                @keydown.enter="save"
                @keydown.escape="close"
              />
              <input
                v-model="((panelDupe.entries[index] as linkGroup).links[groupIndex] as link).favicon"
                placeholder="Link Favicon URL (optional)"
                title="Link Favicon URL (optional)"
                type="text"
                @keydown.enter="save"
                @keydown.escape="close"
              />
            </div>
          </div>
        </div>
        <div v-else class="field">
          <div class="entryTitleRow">
            <PanelSettingsEntryDropdown
              :index="index"
              :length="panelDupe.entries.length"
              :moveEntry="moveEntry"
              :deleteEntry="deleteEntry"
            />
            <input
              v-model="(panelDupe.entries[index] as link).title"
              placeholder="Link Title"
              title="Link Title"
              type="text"
              @keydown.enter="save"
              @keydown.escape="close"
            />
          </div>
          <input
            v-model="(panelDupe.entries[index] as link).url"
            placeholder="Link URL"
            title="Link URL"
            type="text"
            @keydown.enter="save"
            @keydown.escape="close"
          />
          <input
            v-model="(panelDupe.entries[index] as link).favicon"
            placeholder="Link Favicon URL (optional)"
            title="Link Favicon URL (optional)"
            type="text"
            @keydown.enter="save"
            @keydown.escape="close"
          />
        </div>
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
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 75%;
  max-height: 80vh;
  overflow-y: auto;
}

.modalHeader {
  border-bottom: var(--color-border) solid 1px;
  font-size: 1.25rem;
  margin-bottom: 1em;
  padding: 1em 1em;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field input {
  background: var(--color-background);
  border: var(--color-border) solid 1px;
  border-radius: 3px;
  color: var(--color-text);
  font-size: 1em;
  padding: 0.4em 0.6em;
}

.entryWrapper {
  background: var(--color-background-softish);
  /* border: var(--color-border) solid 1px; */
  border-radius: 3px;
  margin: 0 0.5em 1em;
  padding: 0.75em;
}

.entryTitleRow {
  display: flex;
}

.entryTitleRow input {
  flex: 1;
}

.entryTypeLabel {
  font-size: 0.8em;
  color: var(--color-text-muted, var(--color-border));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.entry-menu-btn {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  padding: 0.2em 0.5em;
  border-radius: 3px;
  line-height: 1;
}

.entry-menu-btn:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.entryGroupWrapper {
  display: flex;
  padding-left: 1em;
}

.entryGroupWrapper input {
  flex: 1;
  margin-right: 10px;
}

.entryGroupWrapper input:last-child {
  margin-right: 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}
</style>
