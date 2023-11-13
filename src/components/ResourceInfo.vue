<script setup lang="ts">
import { computed } from 'vue';

import { filesize } from 'filesize';
import { getReasonPhrase } from 'http-status-codes';

import { WebBundle } from '../BundleReader';

const props = defineProps<{
  bundle: WebBundle;
  selectedId: string;
}>();

const response = computed(() => {
  return props.bundle.contents.getResponse(props.selectedId);
});
const responseInfo = computed(() => {
  return props.bundle.index[props.selectedId];
});
const contentType = computed<string | undefined>(() => {
  const entries = Object.entries(response.value.headers);
  const lowered = entries.map(([h, v]) => [h.toLowerCase(), v]);
  return Object.fromEntries(lowered)['content-type'];
});

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
  const blob = new Blob([response.value.body], { type: contentType.value });
  return URL.createObjectURL(blob);
}

function onOpen() {
  const link = document.createElement('a');
  link.href = createBlobUrl();
  link.target = '_blank';
  link.click();
}

function onDownload() {
  const link = document.createElement('a');
  link.href = createBlobUrl();
  link.download = responseInfo.value.pathParts.slice(-1)[0];
  link.click();
}
</script>

<template>
  <div class="px-1">
    <p class="flex items-stretch">
      <span class="flex items-center text-slate-400">
        {{ `${response.status} ${getReasonPhrase(response.status)}` }}
        &nbsp;-&nbsp;
        {{ filesize(response.body.byteLength) }}
      </span>
      <span class="flex-grow"></span>
      <button
        v-if="contentType !== undefined"
        v-for="(action, label) in { Open: onOpen, Download: onDownload }"
        @click="action"
        class="p-1 m-1 rounded text-slate-50 bg-slate-600 hover:bg-slate-500"
      >
        {{ label }}
      </button>
    </p>

    <dl class="inline-grid grid-cols-[auto_1fr] gap-x-3">
      <dt class="text-slate-400">Path</dt>
      <dd>{{ responseInfo.path }}</dd>
      <template v-if="responseInfo.origin !== undefined">
        <dt class="text-slate-400">Origin</dt>
        <dd>
          {{ responseInfo.origin }}
        </dd>
      </template>
    </dl>
  </div>

  <h2 class="p-1 my-3 border-b font-bold dark:border-slate-600">Headers</h2>
  <div class="px-1">
    <i v-if="Object.keys(response.headers).length === 0">None</i>
    <dl v-else class="inline-grid grid-cols-[auto_1fr] gap-x-3">
      <template v-for="(value, name) in response.headers">
        <dt class="text-slate-400">{{ name }}</dt>
        <dd>{{ value }}</dd>
      </template>
    </dl>
  </div>

  <template v-if="contentType !== undefined">
    <h2 class="p-1 my-3 border-b font-bold dark:border-slate-600">Preview</h2>
    <div class="p-1">
      <img v-if="contentType.startsWith('image/')" :src="createBlobUrl()" />
      <pre
        v-else-if="isText(contentType)"
        class="whitespace-pre-wrap overflow-x-auto text-slate-300"
        >{{ fromUtf8(response.body) }}</pre
      >
    </div>
  </template>
</template>
