<script setup lang="ts">
import { Resource } from '../BundleReader';

const props = defineProps<{
  resource: Resource;
}>();

function isText(contentType: string) {
  return (
    contentType.startsWith('text/') ||
    contentType === 'application/javascript' ||
    contentType === 'application/json' ||
    contentType === 'application/manifest+json'
  );
}

function fromUtf8(buffer: Uint8Array) {
  return new TextDecoder().decode(buffer);
}

function createBlobUrl() {
  const blob = new Blob([props.resource.body], {
    type: props.resource.contentType,
  });
  return URL.createObjectURL(blob);
}
</script>

<template>
  <template v-if="resource.contentType !== undefined">
    <h2 class="p-1 my-3 border-b font-bold dark:border-slate-600">Preview</h2>
    <div class="p-1">
      <img
        v-if="resource.contentType.startsWith('image/')"
        :src="createBlobUrl()"
      />
      <pre
        v-else-if="isText(resource.contentType)"
        class="whitespace-pre-wrap overflow-x-auto text-slate-300"
        >{{ fromUtf8(resource.body) }}</pre
      >
    </div>
  </template>
</template>
