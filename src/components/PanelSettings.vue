<script setup lang="ts">
import { ref } from 'vue';
import type { link, linkGroup, panel } from '@/types';

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
</script>

<template>
  <div class="overlay" @click="close">
    <div class="settingsPanel" @click.stop>
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
      <div v-for="(entry, index) in panelDupe.entries" :key="index">
        <div v-if="typeof entry === 'string'" class="field">
          <input
            v-model="panelDupe.entries[index]"
            placeholder="Separator Title"
            title="Separator Title"
            type="text"
            @keydown.enter="save"
            @keydown.escape="close"
          />
        </div>
        <div v-else-if="'links' in entry" class="field">
          <!-- TODO: Be able to edit the title used for the group and favicon, as well as the links inside -->
          <input
            v-model="(panelDupe.entries[index] as linkGroup).title"
            placeholder="Link Group Title"
            title="Link Group Title"
            type="text"
            @keydown.enter="save"
            @keydown.escape="close"
          />
          <input
            v-model="(panelDupe.entries[index] as linkGroup).favicon"
            placeholder="Link Group Favicon URL (optional)"
            title="Link Group Favicon URL (optional)"
            type="text"
            @keydown.enter="save"
            @keydown.escape="close"
          />
          <div v-for="(groupEntry, groupIndex) in (panelDupe.entries[index] as linkGroup).links" :key="groupIndex" class="field">
            <div v-if="typeof groupEntry === 'string'" class="field">
              <input
                v-model="((panelDupe.entries[index] as linkGroup).links[groupIndex] as string)"
                placeholder="Separator Title"
                title="Separator Title"
                type="text"
                @keydown.enter="save"
                @keydown.escape="close"
              />
            </div>
            <div v-else> 
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
          <input
            v-model="(panelDupe.entries[index] as link).title"
            placeholder="Link Title"
            title="Link Title"
            type="text"
            @keydown.enter="save"
            @keydown.escape="close"
          />
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
        <div v-if="index < panel.entries.length - 1" class="separator"></div>
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
  width: 75%;
  max-height: 80vh;
  overflow-y: auto;
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
