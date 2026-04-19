export interface AppData {
  links: panel[];
  preferences: Preferences;
}

export interface Preferences {
  background: Background;
  style: StyleSettings;
  inlineEditing: boolean;
  dragAndDrop: boolean;
  middleClick: boolean;
}
export interface Background {
  image: string;
  repeat: boolean;
  centre: boolean;
  fixed: boolean;
  stretch: boolean;
  lastImage?: any;
}
export interface StyleSettings {
    favicons: boolean;
    fixedTopBar: boolean;
    fluidWidth: boolean;
    font: string;
    linkButtons: boolean;
    pageTitle: string;
    theme: 'light' | 'dark' | 'system';
}

export interface panel {
  entries: panelEntry[]
  title: string
}
export type panelEntry = link | linkGroup | string;
export type groupEntry = link | string;
export interface linkGroup {
  favicon?: string
  links: groupEntry[]
  title: string
}
export interface link {
  favicon?: string
  newTab?: boolean
  title: string
  url: string
  type?: string
}