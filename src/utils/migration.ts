import type { AppData, Background, panel, panelEntry, groupEntry, StyleSettings, Preferences } from '@/types';
import { defaultData } from '@/defaultData';

// ---------------------------------------------------------------------------
// Types used only for the migration pipeline (raw / partially-migrated data)
// ---------------------------------------------------------------------------

type MaybeOldPanel = {
  links?: unknown[];
  entries?: unknown[];
  title: string;
};

type MaybeOldAppData = {
  links?: MaybeOldPanel[] | OldLinksObject;
  preferences?: unknown;
  [key: string]: unknown;
};

// Shape of the very old (jQuery) format stored under the key "newtabreduxweb"
type OldLinksObject = {
  content?: OldPanel[];
  edit?: { menu?: boolean; dragdrop?: boolean };
  behaviour?: { dropdownmiddle?: boolean };
};

type OldPanel = {
  title: string;
  buttons?: OldButton[];
};

type OldButton = {
  title: string;
  url?: string;
  menu?: OldMenuItem[];
  style?: string;
  favicon?: string;
};

type OldMenuItem = {
  title?: string;
  url?: string;
  favicon?: string;
};

type OldStyle = {
  font?: string;
  favicons?: boolean;
  fluid?: boolean;
  topbar?: { fix?: boolean };
  background?: Partial<Background>;
};

type OldGeneral = {
  title?: string;
};

type OldFormat = {
  links?: OldLinksObject;
  style?: OldStyle;
  general?: OldGeneral;
  [key: string]: unknown;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Runs all migration steps on a raw panels array (the value stored in the
 * "Panels" textarea in Settings). Applies the same structural migrations as
 * migrateData but scoped to the panels array only.
 */
export function migratePanels(raw: unknown): panel[] {
  if (!Array.isArray(raw)) {
    throw new Error('Expected an array for links');
  }
  const migrated = migratePanelLinksToEntries({ links: raw });
  return migrated.links as panel[];
}

/**
 * Runs all migration steps on raw imported data, in order.
 * Add new migration functions to extend for future format changes.
 */
export function migrateData(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid data format');
  }

  // Step 1: detect and convert the very old (jQuery/Bootstrap) format
  let data = migrateOldFormatToAppData(raw as Record<string, unknown>);

  // Step 2: rename panel.links → panel.entries (intermediate format)
  data = migratePanelLinksToEntries(data);

  return data as unknown as AppData;
}

// ---------------------------------------------------------------------------
// Migration steps
// ---------------------------------------------------------------------------

/**
 * Migration: the very old format stored under localStorage key "newtabreduxweb"
 * had the shape:
 *   { links: { content: [{title, buttons: [{title, url?, menu?, style?}]}] },
 *     style: { font, favicons, fluid, topbar, background },
 *     general: { title, ... }, ... }
 *
 * Convert it to the current AppData shape:
 *   { links: panel[], preferences: Preferences }
 *
 * A panel `buttons` entry with a `url` becomes a `link`.
 * A panel `buttons` entry with a `menu` becomes a `linkGroup`.
 */
function migrateOldFormatToAppData(raw: Record<string, unknown>): MaybeOldAppData {
  // Detect old format: `links` is a plain object (not an array) with a `content` array
  if (Array.isArray(raw.links) || !raw.links || typeof raw.links !== 'object') {
    return raw as MaybeOldAppData;
  }

  const old = raw as OldFormat;
  const oldLinks = old.links as OldLinksObject;

  if (!Array.isArray(oldLinks.content)) {
    return raw as MaybeOldAppData;
  }

  // Convert panels
  const panels: panel[] = oldLinks.content.map((oldPanel: OldPanel): panel => ({
    title: oldPanel.title ?? '',
    entries: (oldPanel.buttons ?? []).map(convertOldButton),
  }));

  // Convert preferences
  const defaults = defaultData.preferences;
  const oldStyle = old.style ?? {};
  const oldGeneral = old.general ?? {};

  const background: Background = {
    image: oldStyle.background?.image ?? defaults.background.image,
    repeat: oldStyle.background?.repeat ?? defaults.background.repeat,
    centre: oldStyle.background?.centre ?? defaults.background.centre,
    fixed: oldStyle.background?.fixed ?? defaults.background.fixed,
    stretch: oldStyle.background?.stretch ?? defaults.background.stretch,
    lastImage: oldStyle.background?.lastImage ?? undefined,
  };
  if (background.image.endsWith('bg.png')) {
    background.image = '/bg.png';
  }

  const style: StyleSettings = {
    font: oldStyle.font ?? defaults.style.font,
    favicons: oldStyle.favicons ?? defaults.style.favicons,
    fluidWidth: oldStyle.fluid ?? defaults.style.fluidWidth,
    fixedTopBar: oldStyle.topbar?.fix ?? defaults.style.fixedTopBar,
    linkButtons: defaults.style.linkButtons,
    pageTitle: oldGeneral.title ?? defaults.style.pageTitle,
    theme: defaults.style.theme,
  };

  const preferences: Preferences = {
    background,
    style,
    inlineEditing: oldLinks.edit?.menu ?? defaults.inlineEditing,
    dragAndDrop: oldLinks.edit?.dragdrop ?? defaults.dragAndDrop,
    middleClick: oldLinks.behaviour?.dropdownmiddle ?? defaults.middleClick,
  };

  return { links: panels, preferences } as MaybeOldAppData;
}

function convertOldButton(button: OldButton): panelEntry {
  if (Array.isArray(button.menu)) {
    // Dropdown group → linkGroup
    return {
      title: button.title ?? '',
      links: button.menu.map(convertOldMenuItem),
      favicon: button.favicon ?? '',
    };
  }
  // Simple link
  return {
    title: button.title ?? '',
    url: button.url ?? '',
    favicon: button.favicon ?? '',
  };
}

function convertOldMenuItem(item: OldMenuItem): groupEntry {
  // A menu item without both title and url is treated as a visual separator.
  // The string value 'Separator' is a valid groupEntry (groupEntry = link | string).
  if (!item.title && !item.url) return 'Separator';
  return {
    title: item.title ?? '',
    url: item.url ?? '',
    favicon: item.favicon ?? '',
  };
}

/**
 * Migration: panel objects used to have a `links` property instead of `entries`
 * (intermediate format). Rename `links` → `entries` on any panel that has
 * `links` but not `entries`.
 */
function migratePanelLinksToEntries(data: MaybeOldAppData): MaybeOldAppData {
  if (!Array.isArray(data.links)) return data;

  const migratedPanels = (data.links as MaybeOldPanel[]).map((panel: MaybeOldPanel) => {
    if ('links' in panel && !('entries' in panel)) {
      const { links: panelLinks, ...rest } = panel;
      return { ...rest, entries: panelLinks ?? [] };
    }
    return panel;
  });

  return { ...data, links: migratedPanels };
}
