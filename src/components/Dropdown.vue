<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';

const open = ref(false);
const wrapperRef = ref<HTMLElement>();
const menuRef = ref<HTMLElement>();
const menuStyle = ref({ top: '0px', left: '0px', minWidth: '0px' });

const updatePosition = () => {
  if (!wrapperRef.value) return;
  const rect = wrapperRef.value.getBoundingClientRect();
  menuStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`,
  };
};

const adjustForViewport = () => {
  if (!wrapperRef.value || !menuRef.value) return;
  const triggerRect = wrapperRef.value.getBoundingClientRect();
  const menuRect = menuRef.value.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = triggerRect.bottom + 4;
  let left = triggerRect.left;

  // Prevent overflow on the right edge
  if (left + menuRect.width > vw) {
    left = Math.max(0, triggerRect.right - menuRect.width);
  }

  // Prefer opening below; if it overflows the bottom, open above instead
  if (top + menuRect.height > vh) {
    const topAbove = triggerRect.top - menuRect.height - 4;
    if (topAbove >= 0) {
      top = topAbove;
    } else {
      // Neither fits fully; fall back to opening above, clamped to 0
      top = Math.max(0, triggerRect.top - menuRect.height - 4);
    }
  }

  menuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${triggerRect.width}px`,
  };
};

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
  window.addEventListener('scroll', handleDocumentClick as EventListener, true);
  window.addEventListener('resize', adjustForViewport);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true);
  document.removeEventListener('keydown', handleDocumentKeydown);
  window.removeEventListener('scroll', handleDocumentClick as EventListener, true);
  window.removeEventListener('resize', adjustForViewport);
});

const toggle = async () => {
  if (!open.value) {
    updatePosition();
    open.value = true;
    await nextTick();
    adjustForViewport();
  } else {
    open.value = false;
  }
};

const close = () => {
  open.value = false;
};
</script>

<template>
  <div ref="wrapperRef" class="dropdown-wrapper">
    <div class="dropdown-trigger" @click.stop.prevent="toggle">
      <slot name="trigger" :open="open" />
    </div>
    <Teleport to="body">
      <div v-if="open" ref="menuRef" class="dropdown-menu" :style="menuStyle" @click.stop>
        <ul>
          <slot :close="close" />
        </ul>
        <slot name="footer" :close="close" />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dropdown-wrapper {
  position: relative;
}

.dropdown-trigger {
  display: contents;
}
</style>

<style>
.dropdown-menu {
  background: var(--color-background-soft);
  border: var(--color-border) solid 1px;
  border-radius: 3px;
  position: fixed;
  z-index: 1000;
  min-width: 160px;
}

.dropdown-menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown-menu button {
  background: none;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  display: block;
  padding: 0.75em 1em;
  text-align: left;
  width: 100%;
  white-space: nowrap;
}

.dropdown-menu button:hover:not(:disabled) {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.dropdown-menu button:disabled {
  color: var(--color-border);
  cursor: default;
}

.dropdown-menu li.separator {
  border-top: var(--color-border) solid 1px;
  margin: 0.25em 0;
}

.dropdown-menu button.btn-danger {
  color: #c0392b;
}

.dropdown-menu button.btn-danger:hover {
  background-color: hsla(5, 60%, 50%, 0.15);
}

.dropdown-menu a {
  background: none;
  color: var(--color-text);
  display: block;
  padding: 0.75em 1em;
  text-decoration: none;
  white-space: nowrap;
}

.dropdown-menu a:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.dropdown-menu .import-error {
  color: var(--color-danger, #c00);
  font-size: 0.85em;
  margin: 0;
  padding: 0.5em 1.5em;
}
</style>
