<script setup lang="ts">
import type { panel, Preferences } from '@/types';
import { ref, computed } from 'vue';
import Dropdown from './Dropdown.vue';

const props = defineProps<{
  close: () => void;
  links: panel[];
  preferences: Preferences;
  setLinks: (updatedLinks: panel[]) => void;
  setPreferences: (updatedPreferences: Preferences) => void;
}>();

type Tab = 'links' | 'style' | 'json';
const activeTab = ref<Tab>('links');

// Full preferences draft â€” committed to app state only when Save is clicked
const prefDraft = ref<Preferences>(JSON.parse(JSON.stringify(props.preferences)));

// Convenience alias to the background sub-object of the draft
const bgDraft = computed(() => prefDraft.value.background);

// â”€â”€ File picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const fileInputRef = ref<HTMLInputElement | null>(null);

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    bgDraft.value.image = reader.result as string;
    bgDraft.value.lastImage = null;
  };
  reader.readAsDataURL(file);
  input.value = '';
};

// â”€â”€ Background presets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const setPreset = (value: string, repeat: boolean, centre: boolean, fixed: boolean, stretch: boolean, close: () => void) => {
  bgDraft.value.image = value;
  bgDraft.value.lastImage = null;
  bgDraft.value.repeat = repeat;
  bgDraft.value.centre = centre;
  bgDraft.value.fixed = fixed;
  bgDraft.value.stretch = stretch;
  close();
};

const isDynamicBackground = computed(() => {
  const img = bgDraft.value.image ?? '';
  return img.startsWith('unsplash') || img.startsWith('nasa') || img.startsWith('google-earth');
});

// Acts on the live background so Background.vue re-fetches immediately
const fetchNewImage = () => {
  props.preferences.background.lastImage = null;
};

// Google Earth details are owned by Background.vue via lastImage
const googleEarthDetails = computed(() => {
  const img = bgDraft.value.image ?? '';
  const last = props.preferences.background.lastImage;
  if (!img.startsWith('google-earth') || !last?.googleEarth) return null;
  return {
    locality: last.geoLocality as string | undefined,
    country: last.geoCountry as string | undefined,
    lat: last.geoLat as string | undefined,
    lng: last.geoLng as string | undefined,
    zoom: last.geoZoom as number | undefined,
    attribution: last.geoAttribution as string | undefined,
  };
});

// â”€â”€ Links JSON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const linksJson = ref(JSON.stringify(props.links, null, 2));
const linksJsonError = ref('');

const validateLinksJson = (json: string): panel[] | null => {
  try {
    const parsed: panel[] = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      linksJsonError.value = 'Expected an array for links';
      return null;
    }
    linksJsonError.value = '';
    return parsed;
  } catch (e) {
    linksJsonError.value = 'Invalid JSON: ' + (e instanceof Error ? e.message : String(e));
    return null;
  }
};

const onLinksJsonInput = (e: Event) => {
  linksJson.value = (e.target as HTMLTextAreaElement).value;
  validateLinksJson(linksJson.value);
};

// â”€â”€ Preferences JSON (read-only live view of draft) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const preferencesJson = computed(() => {
  // Replace potentially huge lastImage data URIs with a placeholder
  const display = JSON.parse(JSON.stringify(prefDraft.value));
  if (display.background?.lastImage) {
    display.background.lastImage = '[cached image data]';
  }
  return JSON.stringify(display, null, 2);
});

// â”€â”€ Save â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const canSave = computed(() => !linksJsonError.value);

const save = () => {
  const parsedLinks = validateLinksJson(linksJson.value);
  if (!parsedLinks) return;

  // Preserve the live lastImage if the image source is unchanged, so a
  // freshly-fetched image isn't lost. Otherwise clear it to trigger re-fetch.
  const lastImage = bgDraft.value.image === props.preferences.background.image
    ? props.preferences.background.lastImage
    : bgDraft.value.lastImage;

  props.setLinks(parsedLinks);
  props.setPreferences({
    ...prefDraft.value,
    background: { ...bgDraft.value, lastImage },
  });
  props.close();
};
</script>

<template>
  <div class="overlay" @click="close">
    <div class="settings-panel" @click.stop>
      <div class="panel-header">
        <h2>Settings</h2>
        <nav class="tab-bar" role="tablist">
          <button
            v-for="tab in (['links', 'style', 'json'] as const)"
            :key="tab"
            role="tab"
            type="button"
            :class="['tab-btn', { active: activeTab === tab }]"
            :aria-selected="activeTab === tab"
            @click="activeTab = tab"
          >{{ tab.charAt(0).toUpperCase() + tab.slice(1) }}</button>
        </nav>
      </div>

      <!-- â”€â”€ Links tab â”€â”€ -->
      <div v-show="activeTab === 'links'" class="tab-content" role="tabpanel">
        <div class="field-row">
          <label for="links-json" class="field-label">Panels</label>
          <div class="field-controls">
            <textarea
              id="links-json"
              class="code-textarea"
              :value="linksJson"
              @input="onLinksJsonInput"
              rows="16"
              spellcheck="false"
            ></textarea>
            <p v-if="linksJsonError" class="error-text">{{ linksJsonError }}</p>
          </div>
        </div>

        <div class="field-row">
          <span class="field-label">Behaviour</span>
          <div class="checkbox-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="prefDraft.inlineEditing" />
              Inline editing
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="prefDraft.dragAndDrop" />
              Drag and drop
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="prefDraft.middleClick" />
              Middle-click opens links
            </label>
          </div>
        </div>
      </div>

      <!-- â”€â”€ Style tab â”€â”€ -->
      <div v-show="activeTab === 'style'" class="tab-content" role="tabpanel">
        <div class="field-row">
          <label class="field-label">Background</label>
          <div class="field-controls">
            <div class="input-addon-row">
              <input
                class="text-input"
                :value="bgDraft.image"
                @input="bgDraft.image = ($event.target as HTMLInputElement).value"
                placeholder="URL, data URI, or choose a preset"
                type="text"
              />
              <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="handleFileSelect" />
              <Dropdown>
                <template #trigger="{ open }">
                  <button class="btn btn-secondary btn-addon" :aria-expanded="open" type="button" title="Choose a preset">
                    <font-awesome-icon icon="fa-solid fa-chevron-down" />
                  </button>
                </template>
                <template #default="{ close: closeDropdown }">
                  <li><button type="button" @click="fileInputRef?.click(); closeDropdown()"><font-awesome-icon icon="fa-solid fa-folder-open" /> Choose fileâ€¦</button></li>
                  <li><button type="button" @click="setPreset('nasa', false, true, false, true, closeDropdown)"><font-awesome-icon icon="fa-solid fa-earth-americas" /> NASA APOD</button></li>
                  <li><button type="button" @click="setPreset('google-earth', false, true, false, true, closeDropdown)"><font-awesome-icon icon="fa-solid fa-earth-americas" /> Google Earth</button></li>
                  <li class="separator"></li>
                  <li><button type="button" @click="setPreset('unsplash:QUERY_HERE', false, true, false, true, closeDropdown)"><font-awesome-icon icon="fa-solid fa-magnifying-glass" /> Unsplash Query</button></li>
                  <li><button type="button" @click="setPreset('unsplash#COLLECTION_ID', false, true, false, true, closeDropdown)"><font-awesome-icon icon="fa-solid fa-layer-group" /> Unsplash Collection</button></li>
                  <li><button type="button" @click="setPreset('unsplash@USERNAME', false, true, false, true, closeDropdown)"><font-awesome-icon icon="fa-solid fa-user" /> Unsplash User</button></li>
                  <li><button type="button" @click="setPreset('unsplash:landscape', false, true, false, true, closeDropdown)"><font-awesome-icon icon="fa-solid fa-mountain" /> Unsplash Landscape</button></li>
                  <li><button type="button" @click="setPreset('unsplash:city', false, true, false, true, closeDropdown)"><font-awesome-icon icon="fa-solid fa-city" /> Unsplash City</button></li>
                  <li><button type="button" @click="setPreset('unsplash#2403024', false, true, false, true, closeDropdown)"><font-awesome-icon icon="fa-solid fa-tree" /> Unsplash Forest</button></li>
                  <li class="separator"></li>
                  <li><button type="button" @click="setPreset('', false, true, false, false, closeDropdown)"><font-awesome-icon icon="fa-solid fa-xmark" /> No image (blank)</button></li>
                  <li><button type="button" @click="setPreset('/bg.png', true, true, false, false, closeDropdown)"><font-awesome-icon icon="fa-solid fa-rotate-left" /> Reset to default</button></li>
                </template>
              </Dropdown>
            </div>

            <div class="checkbox-row">
              <label class="checkbox-label"><input type="checkbox" v-model="bgDraft.repeat" /> Repeat</label>
              <label class="checkbox-label"><input type="checkbox" v-model="bgDraft.centre" /> Centre</label>
              <label class="checkbox-label"><input type="checkbox" v-model="bgDraft.fixed" /> Fixed</label>
              <label class="checkbox-label"><input type="checkbox" v-model="bgDraft.stretch" /> Stretch</label>
            </div>

            <p class="hint-text">Enter a URL, data URI, or choose a preset. Remote sources won't load offline.</p>

            <button v-if="isDynamicBackground" type="button" class="btn btn-secondary btn-sm" @click="fetchNewImage">
              <font-awesome-icon icon="fa-solid fa-rotate-left" /> Fetch new image
            </button>

            <div v-if="googleEarthDetails" class="geo-details">
              <a
                v-if="googleEarthDetails.lat && googleEarthDetails.lng"
                class="geo-location"
                :href="`https://www.google.com/maps/@?api=1&map_action=map&center=${googleEarthDetails.lat},${googleEarthDetails.lng}&zoom=${googleEarthDetails.zoom}&basemap=satellite`"
                target="_blank" rel="noopener noreferrer" title="Open in Google Maps"
              >{{ googleEarthDetails.locality }}, {{ googleEarthDetails.country }}</a>
              <span v-else>{{ googleEarthDetails.locality }}, {{ googleEarthDetails.country }}</span>
              <span v-if="googleEarthDetails.attribution" class="geo-attribution">{{ googleEarthDetails.attribution }}</span>
            </div>
          </div>
        </div>

        <div class="field-row">
          <span class="field-label">Theme</span>
          <div class="segmented-control">
            <label :class="{ active: prefDraft.style.theme === 'light' }">
              <input type="radio" v-model="prefDraft.style.theme" value="light" /> Light
            </label>
            <label :class="{ active: prefDraft.style.theme === 'system' }">
              <input type="radio" v-model="prefDraft.style.theme" value="system" /> System
            </label>
            <label :class="{ active: prefDraft.style.theme === 'dark' }">
              <input type="radio" v-model="prefDraft.style.theme" value="dark" /> Dark
            </label>
          </div>
        </div>

        <div class="field-row">
          <label for="style-page-title" class="field-label">Page title</label>
          <input id="style-page-title" type="text" class="text-input" v-model="prefDraft.style.pageTitle" placeholder="New Tab Redux" />
        </div>

        <div class="field-row">
          <label for="style-font" class="field-label">Font</label>
          <input id="style-font" type="text" class="text-input" v-model="prefDraft.style.font" placeholder="System default" />
        </div>

        <div class="field-row">
          <span class="field-label">Options</span>
          <div class="checkbox-group">
            <label class="checkbox-label"><input type="checkbox" v-model="prefDraft.style.favicons" /> Show favicons</label>
            <label class="checkbox-label"><input type="checkbox" v-model="prefDraft.style.linkButtons" /> Show links as buttons</label>
            <label class="checkbox-label"><input type="checkbox" v-model="prefDraft.style.fixedTopBar" /> Fixed top bar</label>
            <label class="checkbox-label"><input type="checkbox" v-model="prefDraft.style.fluidWidth" /> Fluid width</label>
          </div>
        </div>
      </div>

      <!-- â”€â”€ JSON tab â”€â”€ -->
      <div v-show="activeTab === 'json'" class="tab-content" role="tabpanel">
        <div class="field-row stacked">
          <label for="prefs-json" class="field-label">Preferences</label>
          <textarea
            id="prefs-json"
            class="code-textarea"
            :value="preferencesJson"
            rows="24"
            readonly
            spellcheck="false"
          ></textarea>
          <p class="hint-text">Read-only view of the current unsaved draft. Make changes via the other tabs.</p>
        </div>
      </div>

      <!-- â”€â”€ Footer â”€â”€ -->
      <div class="dialog-footer">
        <button type="button" class="btn btn-secondary" @click="close">Cancel</button>
        <button type="button" class="btn btn-primary" :disabled="!canSave" @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* â”€â”€ Overlay & panel â”€â”€ */
.overlay {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  z-index: 100;
}

.settings-panel {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  padding: 20px 24px 16px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 52em;
}

/* â”€â”€ Header & tabs â”€â”€ */
.panel-header {
  flex-shrink: 0;
  margin-bottom: 0;
}

.panel-header h2 {
  font-size: 1.1em;
  font-weight: 700;
  margin-bottom: 0.75em;
}

.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0;
  gap: 0;
}

.tab-btn {
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875em;
  margin-bottom: -1px;
  padding: 0.5em 1.25em;
  opacity: 0.55;
  transition: opacity 0.15s, border-color 0.15s, color 0.15s;
}

.tab-btn:hover:not(.active) {
  opacity: 0.8;
}

.tab-btn.active {
  border-bottom-color: hsla(160, 100%, 37%, 1);
  color: hsla(160, 100%, 37%, 1);
  font-weight: 600;
  opacity: 1;
}

/* â”€â”€ Tab content â”€â”€ */
.tab-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 1.25em;
  padding-bottom: 0.5em;
}

/* â”€â”€ Field rows â”€â”€ */
.field-row {
  display: grid;
  grid-template-columns: 8em 1fr;
  align-items: start;
  column-gap: 1em;
  row-gap: 0.35em;
  margin-bottom: 1.1em;
}

.field-row.stacked {
  grid-template-columns: 1fr;
}

.field-label {
  color: var(--color-text);
  font-size: 0.875em;
  font-weight: 600;
  padding-top: 0.45em;
}

.field-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

/* â”€â”€ Inputs â”€â”€ */
.text-input {
  background: var(--color-background);
  border: 1px solid var(--color-border-hover, var(--color-border));
  border-radius: 4px;
  color: var(--color-text);
  font-size: 0.875em;
  padding: 0.4em 0.6em;
  width: 100%;
}

.text-input:focus {
  outline: none;
  border-color: hsla(160, 100%, 37%, 0.6);
}

.code-textarea {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text);
  font-family: monospace;
  font-size: 0.8em;
  padding: 0.5em 0.6em;
  resize: vertical;
  width: 100%;
}

.code-textarea:focus {
  outline: none;
  border-color: hsla(160, 100%, 37%, 0.6);
}

/* â”€â”€ Input + dropdown addon â”€â”€ */
.input-addon-row {
  display: flex;
}

.input-addon-row .text-input {
  border-right: none;
  border-radius: 4px 0 0 4px;
  flex: 1;
  min-width: 0;
}

/* â”€â”€ Checkboxes â”€â”€ */
.checkbox-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25em 1em;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.4em;
}

.checkbox-label {
  align-items: center;
  cursor: pointer;
  display: flex;
  font-size: 0.875em;
  gap: 0.45em;
  user-select: none;
}

/* â”€â”€ Segmented control (theme) â”€â”€ */
.segmented-control {
  display: inline-flex;
  border: 1px solid var(--color-border-hover, var(--color-border));
  border-radius: 4px;
  overflow: hidden;
}

.segmented-control label {
  cursor: pointer;
  font-size: 0.875em;
  padding: 0.35em 0.9em;
  user-select: none;
  transition: background-color 0.15s, color 0.15s;
}

.segmented-control label:not(:last-child) {
  border-right: 1px solid var(--color-border);
}

.segmented-control label input[type="radio"] {
  height: 0;
  opacity: 0;
  position: absolute;
  width: 0;
}

.segmented-control label.active {
  background: hsla(160, 100%, 37%, 0.15);
  color: hsla(160, 100%, 37%, 1);
  font-weight: 600;
}

/* â”€â”€ Hints & errors â”€â”€ */
.hint-text {
  color: var(--color-text);
  font-size: 0.78em;
  line-height: 1.4;
  opacity: 0.6;
}

.error-text {
  color: #c0392b;
  font-size: 0.8em;
}

/* â”€â”€ Google Earth details â”€â”€ */
.geo-details {
  display: flex;
  flex-direction: column;
  font-size: 0.8em;
  gap: 0.2em;
}

.geo-location {
  color: hsla(160, 100%, 37%, 1);
  text-decoration: none;
}

.geo-location:hover {
  text-decoration: underline;
}

.geo-attribution {
  opacity: 0.6;
}

/* â”€â”€ Footer â”€â”€ */
.dialog-footer {
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 0.75em;
  padding-top: 0.75em;
}

/* â”€â”€ Buttons â”€â”€ */
.btn {
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875em;
  padding: 0.4em 0.9em;
  transition: background-color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.btn:disabled {
  cursor: default;
  opacity: 0.45;
}

.btn-sm {
  align-self: flex-start;
}

.btn-primary {
  background: hsla(160, 100%, 37%, 1);
  border-color: hsla(160, 100%, 30%, 1);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: hsla(160, 100%, 30%, 1);
}

.btn-secondary {
  background: var(--color-background);
  border-color: var(--color-border-hover, var(--color-border));
  color: var(--color-text);
}

.btn-secondary:hover:not(:disabled) {
  background-color: hsla(160, 100%, 37%, 0.12);
  border-color: hsla(160, 100%, 37%, 0.4);
}

.btn-addon {
  border-radius: 0 4px 4px 0;
}
</style>