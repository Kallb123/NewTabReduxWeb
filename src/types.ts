export interface AppData {
  links: import('./components/LinkPanel.vue').panel[];
  preferences: {
    background: string;
    style: {
        linkButtons: boolean;
    }
  };
}