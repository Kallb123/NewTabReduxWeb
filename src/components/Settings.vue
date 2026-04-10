<script setup lang="ts">
import type { panel, Preferences } from '@/types';
import { ref, watch, computed, type Ref } from 'vue';
import Dropdown from './Dropdown.vue';

const props = defineProps<{
  close: () => void;
  links: panel[];
  preferences: Preferences;
  setLinks: (updatedLinks: panel[]) => void;
  setPreferences: (updatedPreferences: Preferences) => void;
}>();

// Local draft — changes are only committed to app state when Save is clicked
const bgDraft = ref({ ...props.preferences.background }) as Ref<typeof props.preferences.background>;

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
  // Reset so the same file can be re-selected
  input.value = '';
};

const setPreset = (value: string, repeat: boolean, centre: boolean, fixed: boolean, stretch: boolean, closeDropdown: () => void) => {
  bgDraft.value.image = value;
  bgDraft.value.lastImage = null;
  bgDraft.value.repeat = repeat;
  bgDraft.value.stretch = stretch;
  bgDraft.value.centre = centre;
  bgDraft.value.fixed = fixed;
  closeDropdown();
};

const isDynamicBackground = computed(() => {
  const img = bgDraft.value.image ?? '';
  return img.startsWith('unsplash') || img.startsWith('nasa') || img.startsWith('google-earth');
});

const fetchNewImage = () => {
  // Act on the live background so Background.vue re-fetches immediately
  props.preferences.background.lastImage = null;
};

const googleEarthDetails = computed(() => {
  const img = bgDraft.value.image ?? '';
  // Always read from the live lastImage — Background.vue owns this value
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

const linksJson = ref('');
const preferencesJson = ref('');

const parseLinksError = ref('');
const parsePreferencesError = ref('');

const save = () => {
  const parsedLinks = parseLinks(linksJson.value);
  const parsedPreferences = parsePreferences(preferencesJson.value);
  if (parsedLinks && parsedPreferences) {
    // If the image source hasn't changed, preserve the live lastImage so a
    // freshly-fetched image isn't discarded; otherwise use the draft value
    // (null) to force a re-fetch after the new setting is applied.
    const lastImage = bgDraft.value.image === props.preferences.background.image
      ? props.preferences.background.lastImage
      : bgDraft.value.lastImage;
    parsedPreferences.background = { ...bgDraft.value, lastImage };
    props.setLinks(parsedLinks);
    props.setPreferences(parsedPreferences);
    props.close();
  }
};

const parseLinks: (jsonString: string) => panel[] | null = (jsonString) => {
  try {
    const parsed: panel[] = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      parseLinksError.value = 'Expected an array for appData.links';
      return null;
    }
    parseLinksError.value = '';
    return parsed;
  } catch (error) {
    parseLinksError.value = 'Invalid JSON: ' + (error instanceof Error ? error.message : String(error));
    return null;
  }
}

const parsePreferences: (jsonString: string) => Preferences | null = (jsonString) => {
  try {
    const parsed: Preferences = JSON.parse(jsonString);
    if (!parsed.background || !parsed.style) {
      parsePreferencesError.value = 'Missing required fields in appData.preferences';
      return null;
    }
    parsePreferencesError.value = '';
    return parsed;
  } catch (error) {
    parsePreferencesError.value = 'Invalid JSON: ' + (error instanceof Error ? error.message : String(error));
    return null;
  }
}

watch(
  () => props.links,
  (value) => {
    try {
      linksJson.value = JSON.stringify(value, null, 2);
      parseLinksError.value = '';
    } catch {
      linksJson.value = '';
      parseLinksError.value = 'Cannot serialize links to JSON';
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.preferences,
  (value) => {
    try {
      preferencesJson.value = JSON.stringify(value, null, 2);
      parsePreferencesError.value = '';
    } catch {
      preferencesJson.value = '';
      parsePreferencesError.value = 'Cannot serialize preferences to JSON';
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => linksJson.value,
  (value) => {
    parseLinks(value);
  },
  { immediate: true, deep: true }
);

watch(
  () => preferencesJson.value,
  (value) => {
    parsePreferences(value);
  },
  { immediate: true, deep: true }
);

</script>

<template>
  <div class="overlay" @click="close">
    <div class="settingsPanel" @click.stop>
      <h2>Settings</h2>

      <!-- Background settings -->
      <div class="settings-section">
        <label class="settings-section-label">Background</label>
        <div class="settings-controls">
          <div class="input-with-addon">
            <input
              class="background-image-input"
              :value="bgDraft.image"
              @input="bgDraft.image = ($event.target as HTMLInputElement).value"
              placeholder="Image URL, data URI, or preset"
              type="text"
            />
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileSelect"
            />
            <Dropdown>
              <template #trigger="{ open }">
                <button class="btn btn-secondary btn-addon" :aria-expanded="open" type="button" title="Choose a background preset">
                  <font-awesome-icon icon="fa-solid fa-chevron-down" />
                </button>
              </template>
              <template #default="{ close: closeDropdown }">
                <li>
                  <button type="button" @click="fileInputRef?.click(); closeDropdown()">
                    <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> Choose file...
                  </button>
                </li>
                <li>
                  <button type="button" @click="setPreset('nasa', true, true, false, true, closeDropdown)">
                    <font-awesome-icon icon="fa-solid fa-earth-americas" /> NASA APOD
                  </button>
                </li>
                <li>
                  <button type="button" @click="setPreset('google-earth', true, true, false, true, closeDropdown)">
                    <font-awesome-icon icon="fa-solid fa-earth-americas" /> Google Earth
                  </button>
                </li>
                <li class="separator"></li>
                <li>
                  <button type="button" @click="setPreset('unsplash:QUERY_HERE', true, true, false, true, closeDropdown)">
                    <font-awesome-icon icon="fa-solid fa-magnifying-glass" /> Unsplash Query
                  </button>
                </li>
                <li>
                  <button type="button" @click="setPreset('unsplash#COLLECTION_ID1,COLLECTION_ID2', true, true, false, true, closeDropdown)">
                    <font-awesome-icon icon="fa-solid fa-layer-group" /> Unsplash Collection
                  </button>
                </li>
                <li>
                  <button type="button" @click="setPreset('unsplash@USERNAME', true, true, false, true, closeDropdown)">
                    <font-awesome-icon icon="fa-solid fa-user" /> Unsplash User
                  </button>
                </li>
                <li>
                  <button type="button" @click="setPreset('unsplash:landscape', true, true, false, true, closeDropdown)">
                    <font-awesome-icon icon="fa-solid fa-mountain" /> Unsplash Landscape Query
                  </button>
                </li>
                <li>
                  <button type="button" @click="setPreset('unsplash:city', true, true, false, true, closeDropdown)">
                    <font-awesome-icon icon="fa-solid fa-city" /> Unsplash City Query
                  </button>
                </li>
                <li>
                  <button type="button" @click="setPreset('unsplash#2403024', true, true, false, true, closeDropdown)">
                    <font-awesome-icon icon="fa-solid fa-tree" /> Unsplash Forest Collection
                  </button>
                </li>
                <li class="separator"></li>
                <li>
                  <button type="button" @click="setPreset('', true, true, false, true, closeDropdown)">
                    <font-awesome-icon icon="fa-solid fa-xmark" /> No image (blank)
                  </button>
                </li>
                <li>
                  <button type="button" @click="setPreset('/bg.png', true, true, false, false, closeDropdown)">
                    <font-awesome-icon icon="fa-solid fa-rotate-left" /> Reset to default
                  </button>
                </li>
              </template>
            </Dropdown>
          </div>

          <div class="checkbox-row">
            <label>
              <input type="checkbox" :checked="bgDraft.repeat" @change="bgDraft.repeat = ($event.target as HTMLInputElement).checked" />
              Repeat
            </label>
            <label>
              <input type="checkbox" :checked="bgDraft.centre" @change="bgDraft.centre = ($event.target as HTMLInputElement).checked" />
              Centre
            </label>
            <label>
              <input type="checkbox" :checked="bgDraft.fixed" @change="bgDraft.fixed = ($event.target as HTMLInputElement).checked" />
              Fixed
            </label>
            <label>
              <input type="checkbox" :checked="bgDraft.stretch" @change="bgDraft.stretch = ($event.target as HTMLInputElement).checked" />
              Stretch
            </label>
          </div>

          <p class="settings-hint">
            Select a file from your computer, or enter a data URI or remote URL. Note: remote backgrounds will not load when working offline.
          </p>

          <button v-if="isDynamicBackground" type="button" class="btn btn-secondary fetch-btn" @click="fetchNewImage">
            <font-awesome-icon icon="fa-solid fa-rotate-left" /> Fetch new image
          </button>

          <div v-if="googleEarthDetails" class="google-earth-details">
            <a
              v-if="googleEarthDetails.lat && googleEarthDetails.lng"
              class="google-earth-location"
              :href="`https://www.google.com/maps/@?api=1&map_action=map&center=${googleEarthDetails.lat},${googleEarthDetails.lng}&zoom=${googleEarthDetails.zoom}&basemap=satellite`"
              target="_blank"
              rel="noopener noreferrer"
              title="Open location in Google Maps"
            >{{ googleEarthDetails.locality }}, {{ googleEarthDetails.country }}</a>
            <span v-else>{{ googleEarthDetails.locality }}, {{ googleEarthDetails.country }}</span>
            <span v-if="googleEarthDetails.attribution" class="google-earth-attribution">{{ googleEarthDetails.attribution }}</span>
          </div>
        </div>
      </div>

      <hr class="settings-divider" />

      <label for="links-json">Edit links (JSON)</label>
      <textarea
        id="links-json"
        v-model="linksJson"
        rows="18"
        style="width: 100%; font-family: monospace;"
      ></textarea>

      <label for="preferences-json">Edit preferences (JSON)</label>
      <textarea
        id="preferences-json"
        v-model="preferencesJson"
        rows="18"
        style="width: 100%; font-family: monospace;"
      ></textarea>

      <p v-if="parseLinksError" style="color: red; margin: 8px 0;">{{ parseLinksError }}</p>
      <p v-if="parsePreferencesError" style="color: red; margin: 8px 0;">{{ parsePreferencesError }}</p>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px;">
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
  width: 50em;
  max-height: 90vh;
  overflow-y: auto;
}

/* Background section */
.settings-section {
  display: grid;
  grid-template-columns: 8em 1fr;
  gap: 0.5em 1em;
  align-items: start;
  margin-bottom: 1em;
}

.settings-section-label {
  font-weight: 600;
  padding-top: 0.4em;
}

.settings-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.input-with-addon {
  display: flex;
}

.background-image-input {
  flex: 1;
  background: var(--color-background);
  border: 1px solid var(--color-border-hover, var(--color-border));
  border-right: none;
  border-radius: 4px 0 0 4px;
  color: var(--color-text);
  font-size: 0.875em;
  padding: 0.4em 0.6em;
  min-width: 0;
}

.background-image-input:focus {
  outline: none;
  border-color: hsla(160, 100%, 37%, 0.6);
}

.checkbox-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25em 1em;
}

.checkbox-row label {
  display: flex;
  align-items: center;
  gap: 0.35em;
  cursor: pointer;
  user-select: none;
}

.settings-hint {
  font-size: 0.8em;
  color: var(--color-text);
  opacity: 0.65;
  line-height: 1.4;
}

.fetch-btn {
  align-self: flex-start;
}

.settings-divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1em 0;
}

/* Button styles (mirrors PanelSettings) */
.btn {
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875em;
  padding: 0.4em 0.75em;
  transition: background-color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.btn-secondary {
  background: var(--color-background);
  border-color: var(--color-border-hover, var(--color-border));
  color: var(--color-text);
}

.btn-secondary:hover {
  background-color: hsla(160, 100%, 37%, 0.15);
}

.btn-addon {
  border-radius: 0 4px 4px 0;
}

.google-earth-details {
  display: flex;
  flex-direction: column;
  gap: 0.2em;
  font-size: 0.8em;
}

.google-earth-location {
  color: hsla(160, 100%, 37%, 1);
  text-decoration: none;
}

.google-earth-location:hover {
  text-decoration: underline;
}

.google-earth-attribution {
  opacity: 0.65;
}
</style>
