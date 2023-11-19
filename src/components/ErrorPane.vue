<script setup lang="ts">
import { Error } from './SidePane.vue';
import Header from './Header.vue';

defineProps<{
  error: Error;
}>();

function stringifyError(error: Error) {
  switch (error) {
    case 'BAD_MAGIC':
      return 'Invalid bundle: expected magic bytes \'🖋📦\' or \'🌐📦\'';
    case 'SIG_INVALID':
      return 'The integrity block has an unrecognized structure.';
    case 'SIG_UNKNOWN_VERSION':
      return 'The integrity block has an unknown version.';
    case 'SIG_UNSUPPORTED_KEY_TYPE':
      return 'Unsupported public key type in integrity block. Only ed25519 is supported';
    case 'TOO_MANY_FILES':
      return 'Too many files were selected.';
  }
}
</script>

<template>
  <Header sticky>Error</Header>
  <p class="p-1">
    {{ stringifyError(error) }}
  </p>
</template>
