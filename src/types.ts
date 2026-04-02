export interface AppData {
  links: panel[];
  preferences: {
    background: string;
    style: {
        linkButtons: boolean;
    }
  };
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
  title: string
  url: string
  type?: string
}