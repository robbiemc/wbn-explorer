<script setup lang="ts">
import { Error } from './SidePanel.vue';
import Header from './Header.vue';

defineProps<{
  error: Error;
}>();

function stringifyError(error: Error) {
  switch (error) {
    case 'BAD_MAGIC':
    case 'SIG_INVALID':
    case 'SIG_UNKNOWN_VERSION':
    case 'SIG_UNSUPPORTED_KEY_TYPE':
    case 'TOO_MANY_FILES':
      return error;
  }
}
</script>

<template>
  <Header sticky>Error</Header>
  <p class="p-1">
    {{ stringifyError(error) }}
  </p>
</template>
