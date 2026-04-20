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

const moveGroupEntry = (panelIndex: number, groupIndex: number, direction: 'top' | 'up' | 'down' | 'bottom') => {
  const group = panelDupe.value.entries[panelIndex];
  if (!group || typeof group === 'string' || !('links' in group)) return;
  const links = group.links;
  const [entry] = links.splice(groupIndex, 1);
  if (!entry) return;
  if (direction === 'top') links.unshift(entry);
  else if (direction === 'up') links.splice(groupIndex - 1, 0, entry);
  else if (direction === 'down') links.splice(groupIndex + 1, 0, entry);
  else links.push(entry);
};

const deleteGroupEntry = (panelIndex: number, groupIndex: number) => {
  const group = panelDupe.value.entries[panelIndex];
  if (!group || typeof group === 'string' || !('links' in group)) return;
  if (confirm('Are you sure you want to delete this entry?')) {
    group.links.splice(groupIndex, 1);
  }
};

const addLink = () => {
  panelDupe.value.entries.push({ title: '', url: '' });
};

const addLinkGroup = () => {
  panelDupe.value.entries.push({ title: '', links: [] });
};

const addSeparator = () => {
  panelDupe.value.entries.push('');
};

const addGroupLink = (entryIndex: number) => {
  const group = panelDupe.value.entries[entryIndex];
  if (!group || typeof group === 'string' || !('links' in group)) return;
  group.links.push({ title: '', url: '' });
};

const addGroupSeparator = (entryIndex: number) => {
  const group = panelDupe.value.entries[entryIndex];
  if (!group || typeof group === 'string' || !('links' in group)) return;
  group.links.push('');
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
            <div v-if="typeof groupEntry === 'string'" class="entryGroupWrapper">
              <PanelSettingsEntryDropdown
                :index="groupIndex"
                :length="(panelDupe.entries[index] as linkGroup).links.length"
                :moveEntry="(i, dir) => moveGroupEntry(index, i, dir)"
                :deleteEntry="(i) => deleteGroupEntry(index, i)"
              />
              <input
                v-model="((panelDupe.entries[index] as linkGroup).links[groupIndex] as string)"
                placeholder="Separator Title"
                title="Separator Title"
                type="text"
                @keydown.enter="save"
                @keydown.escape="close"
              />
            </div>
            <div v-else class="entryGroupWrapper entryGroupLink">
              <PanelSettingsEntryDropdown
                :index="groupIndex"
                :length="(panelDupe.entries[index] as linkGroup).links.length"
                :moveEntry="(i, dir) => moveGroupEntry(index, i, dir)"
                :deleteEntry="(i) => deleteGroupEntry(index, i)"
              />
              <input
                v-model="((panelDupe.entries[index] as linkGroup).links[groupIndex] as link).title"
                placeholder="Link Title"
                title="Link Title"
                type="text"
                @keydown.enter="save"
                @keydown.escape="close"
              />
              <div class="entryUrlRow">
                <input
                  v-model="((panelDupe.entries[index] as linkGroup).links[groupIndex] as link).url"
                  placeholder="Link URL"
                  title="Link URL"
                  type="text"
                  @keydown.enter="save"
                  @keydown.escape="close"
                />
                <label class="newTabToggle" title="Open in new tab">
                  <input
                    v-model="((panelDupe.entries[index] as linkGroup).links[groupIndex] as link).newTab"
                    type="checkbox"
                  />
                </label>
              </div>
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
          <div class="groupActions">
            <button type="button" class="btn btn-secondary" @click="addGroupLink(index)">
              <font-awesome-icon icon="fa-solid fa-plus" /> Add Link
            </button>
            <button type="button" class="btn btn-secondary" @click="addGroupSeparator(index)">
              <font-awesome-icon icon="fa-solid fa-minus" /> Add Separator
            </button>
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
          <div class="entryUrlRow">
            <input
              v-model="(panelDupe.entries[index] as link).url"
              placeholder="Link URL"
              title="Link URL"
              type="text"
              @keydown.enter="save"
              @keydown.escape="close"
            />
            <label class="newTabToggle" title="Open in new tab">
              <input
                v-model="(panelDupe.entries[index] as link).newTab"
                type="checkbox"
              />
            </label>
          </div>
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
        <div class="addActions">
          <button type="button" class="btn btn-secondary" @click="addLink">
            <font-awesome-icon icon="fa-solid fa-plus" /> Add Link
          </button>
          <button type="button" class="btn btn-secondary" @click="addLinkGroup">
            <font-awesome-icon icon="fa-solid fa-folder-plus" /> Add Link Group
          </button>
          <button type="button" class="btn btn-secondary" @click="addSeparator">
            <font-awesome-icon icon="fa-solid fa-minus" /> Add Separator
          </button>
        </div>
        <div class="saveActions">
          <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
          <button type="button" class="btn btn-primary" @click="save">Save</button>
        </div>
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
  --color-primary: hsla(160, 100%, 37%, 1);
  --color-primary-dark: hsla(160, 100%, 30%, 1);
  --color-primary-subtle: hsla(160, 100%, 37%, 0.15);
  --color-primary-border: hsla(160, 100%, 37%, 0.5);
  background: var(--color-background);
  border: var(--color-border) solid 1px;
  border-radius: 8px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  overflow-y: auto;
  width: min(52em, calc(100vw - 1rem));
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
  background-color: var(--color-primary-subtle);
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

@media (max-width: 550px) {
  .entryGroupLink {
    flex-wrap: wrap;
  }

  .entryGroupLink input:nth-of-type(n+2) {
    flex-basis: 100%;
    margin-right: 0;
  }

  .modalHeader {
    padding: 0.75em;
  }

  .entryWrapper {
    margin: 0 0 0.75em;
  }
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 12px 0.5em 0.75em;
}

.addActions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.saveActions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.groupActions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
  padding-left: 1em;
}

.entryUrlRow {
  display: flex;
}

.entryUrlRow > input {
  border-radius: 3px 0 0 3px;
  flex: 1;
}

.newTabToggle {
  align-items: center;
  background: var(--color-background);
  border: var(--color-border) solid 1px;
  border-left: none;
  border-radius: 0 3px 3px 0;
  cursor: pointer;
  display: flex;
  padding: 0.2em 0.5em;
}

.newTabToggle:hover {
  background-color: var(--color-primary-subtle);
  border-color: var(--color-primary-border);
}

.entryGroupWrapper .entryUrlRow {
  flex: 1;
  margin-right: 10px;
}

.entryGroupWrapper .entryUrlRow > input {
  margin-right: 0;
  width: 0;
}

.btn {
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875em;
  padding: 0.4em 0.75em;
  transition: background-color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary-dark);
  color: #fff;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--color-background);
  border-color: var(--color-border-hover, var(--color-border));
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: var(--color-primary-subtle);
  border-color: var(--color-primary-border);
}

/* ── Mobile ── */
@media (max-width: 540px) {
  .settingsPanel {
    max-height: 95vh;
    padding: 16px 14px 12px;
  }
}
</style>
