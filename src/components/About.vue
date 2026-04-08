<script setup lang="ts">
import { onMounted, ref } from 'vue';

defineProps<{
  close: () => void;
}>();

const repoUrl = 'https://github.com/Kallb123/NewTabReduxWeb';

interface Branch {
  name: string;
  deployUrl: string;
}

// Cloudflare Pages sanitises branch names for subdomain use:
// non-alphanumeric chars → '-', consecutive '-' collapsed, leading/trailing '-' stripped, truncated to 28 chars, lowercased.
const toCloudflareSubdomain = (branchName: string): string => {
  return branchName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28)
    .replace(/-+$/g, '');
};

const branches = ref<Branch[]>([]);
const loading = ref(true);
const fetchError = ref('');

onMounted(async () => {
  try {
    const response = await fetch('https://api.github.com/repos/Kallb123/NewTabReduxWeb/branches');
    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }
    const data: { name: string }[] = await response.json();
    branches.value = data.map(({ name }) => ({
      name,
      deployUrl: `https://${toCloudflareSubdomain(name)}.newtabreduxweb.pages.dev/`,
    }));
  } catch (err) {
    fetchError.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="overlay" @click="close">
    <div class="aboutPanel" @click.stop>
      <h2>New Tab Redux</h2>

      <p>
        <a :href="repoUrl" target="_blank" rel="noopener noreferrer">{{ repoUrl }}</a>
      </p>

      <h3>Branch Deployments</h3>
      <p v-if="loading" style="color: var(--color-text-muted, gray);">Loading branches…</p>
      <p v-else-if="fetchError" style="color: red;">Failed to load branches: {{ fetchError }}</p>
      <ul v-else>
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
