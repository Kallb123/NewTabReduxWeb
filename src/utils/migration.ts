import type { AppData } from '@/types';

type MaybeOldPanel = {
  links?: unknown[];
  entries?: unknown[];
  title: string;
};

type MaybeOldAppData = {
  links?: MaybeOldPanel[];
  preferences?: unknown;
  [key: string]: unknown;
};

/**
 * Runs all migration steps on raw imported data.
 * Add new migration functions below to extend for future format changes.
 */
export function migrateData(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid data format');
  }

  let data = raw as MaybeOldAppData;

  data = migratePanelLinksToEntries(data);

  return data as unknown as AppData;
}

/**
 * Migration: panel objects used to have a `links` property instead of `entries`.
 * Rename `links` → `entries` on any panel that has `links` but not `entries`.
 */
function migratePanelLinksToEntries(data: MaybeOldAppData): MaybeOldAppData {
  if (!Array.isArray(data.links)) return data;

  const migratedPanels = data.links.map((panel: MaybeOldPanel) => {
    if ('links' in panel && !('entries' in panel)) {
      const { links: panelLinks, ...rest } = panel;
      return { ...rest, entries: panelLinks ?? [] };
    }
    return panel;
  });

  return { ...data, links: migratedPanels };
}
