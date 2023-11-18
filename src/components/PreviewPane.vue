<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { Resource } from '../BundleReader';

const props = defineProps<{
  resource: Resource;
}>();

const TRUNCATION_LIMIT = 10000;

const formattedText = ref<string | undefined>(undefined);
watch(props, () => (formattedText.value = undefined));

const isText = computed(() => {
  const contentType = props.resource.contentType;
  return (
    contentType !== undefined &&
    (contentType.startsWith('text/') ||
      contentType === 'application/javascript' ||
      contentType === 'application/json' ||
      contentType === 'application/manifest+json')
  );
});

const isJson = computed(() => {
  return isText.value && props.resource.contentType?.endsWith('json');
});

const isImage = computed(() => {
  const contentType = props.resource.contentType;
  return contentType !== undefined && contentType.startsWith('image/');
});

const truncatedText = computed(() => {
  const body = props.resource.body;
  if (!isText.value || body.length < TRUNCATION_LIMIT) {
    return undefined;
  }
  return fromUtf8(new Uint8Array(body.buffer, 0, TRUNCATION_LIMIT));
});

const previewBody = computed(() => {
  return (
    formattedText.value || truncatedText.value || fromUtf8(props.resource.body)
  );
});

function fromUtf8(buffer: Uint8Array) {
  return new TextDecoder().decode(buffer);
}

function createBlobUrl() {
  const blob = new Blob([props.resource.body], {
    type: props.resource.contentType,
  });
  return URL.createObjectURL(blob);
}

function formatJson() {
  try {
    const json = JSON.parse(previewBody.value);
    formattedText.value = JSON.stringify(json, null, '  ');
  } catch (e) {}
}
</script>

<template>
  <template v-if="isText || isImage">
    <h2 class="flex p-1 my-3 border-b font-bold dark:border-slate-600">
      <span class="flex-grow">
        Preview
        <i v-if="truncatedText !== undefined">(Truncated)</i>
        <i v-if="formattedText !== undefined">(Formatted)</i>
      </span>
      <button
        v-if="
          isJson && truncatedText === undefined && formattedText === undefined
        "
        @click="formatJson"
        class="px-1 rounded font-normal text-slate-50 bg-slate-600 hover:bg-slate-500"
      >
        Format
      </button>
    </h2>
    <div class="p-1">
      <img v-if="isImage" :src="createBlobUrl()" />
      <pre
        v-else-if="isText"
        class="whitespace-pre-wrap overflow-x-auto text-slate-300"
        >{{ previewBody }}</pre
      >
    </div>
  </template>
</template>
