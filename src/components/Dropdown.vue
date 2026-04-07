<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const open = ref(false);
const wrapperRef = ref<HTMLElement>();

const handleDocumentClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (wrapperRef.value && !wrapperRef.value.contains(target)) {
    open.value = false;
  }
};

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    open.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true);
  document.addEventListener('keydown', handleDocumentKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true);
  document.removeEventListener('keydown', handleDocumentKeydown);
});

const toggle = () => {
  open.value = !open.value;
};

const close = () => {
  open.value = false;
};
</script>

<template>
  <div ref="wrapperRef" class="dropdown-wrapper">
    <div class="dropdown-trigger" @click.stop="toggle">
      <slot name="trigger" :open="open" />
    </div>
    <div v-if="open" class="dropdown-menu" @click.stop>
      <ul>
        <slot :close="close" />
      </ul>
    </div>
  </div>
</template>

<style scoped>
.dropdown-wrapper {
  position: relative;
}

.dropdown-trigger {
  display: contents;
}

.dropdown-menu {
  background: var(--color-background-soft);
  border: var(--color-border) solid 1px;
  border-radius: 3px;
  left: 0;
  position: absolute;
  top: calc(100% + 4px);
  z-index: 10;
  min-width: 160px;
}

.dropdown-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
