<script setup lang="ts">
defineProps<{
  close: () => void;
}>();

const repoUrl = 'https://github.com/Kallb123/NewTabReduxWeb';

const branches: { name: string; deployUrl: string }[] = [
  { name: 'main', deployUrl: 'https://main.newtabreduxweb.pages.dev/' },
  { name: 'feature/vue-rewrite', deployUrl: 'https://feature-vue-rewrite.newtabreduxweb.pages.dev/' },
  { name: 'feature/restrict-large-background', deployUrl: 'https://feature-restrict-large-background.newtabreduxweb.pages.dev/' },
  { name: 'copilot/add-about-modal-header-menu', deployUrl: 'https://copilot-add-about-modal-header-menu.newtabreduxweb.pages.dev/' },
  { name: 'copilot/add-entry-dropdown-to-link-group', deployUrl: 'https://copilot-add-entry-dropdown-to-link-group.newtabreduxweb.pages.dev/' },
  { name: 'copilot/add-panel-settings-dropdown-options', deployUrl: 'https://copilot-add-panel-settings-dropdown-options.newtabreduxweb.pages.dev/' },
];
</script>

<template>
  <div class="overlay" @click="close">
    <div class="aboutPanel" @click.stop>
      <h2>New Tab Redux</h2>

      <p>
        <a :href="repoUrl" target="_blank" rel="noopener noreferrer">{{ repoUrl }}</a>
      </p>

      <h3>Branch Deployments</h3>
      <ul>
        <li v-for="branch in branches" :key="branch.name">
          <a :href="branch.deployUrl" target="_blank" rel="noopener noreferrer">{{ branch.name }}</a>
        </li>
      </ul>

      <div style="display: flex; justify-content: flex-end; margin-top: 12px;">
        <button type="button" @click="close">Close</button>
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

.aboutPanel {
  background: var(--color-background);
  border: var(--color-border) solid 1px;
  border-radius: 8px;
  padding: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36em;
}

ul {
  list-style: none;
  margin: 8px 0;
  padding: 0;
}

li {
  padding: 4px 0;
}
</style>
