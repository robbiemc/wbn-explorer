<script setup lang="ts">
import { filesize } from 'filesize';
import { getReasonPhrase } from 'http-status-codes';
// @ts-ignore
import textEllipsis from 'text-ellipsis';

import { Resource } from '../BundleReader';
import Header from './Header.vue';

const props = defineProps<{
  resource: Resource;
}>();

function createBlobUrl() {
  const blob = new Blob([props.resource.body], {
    type: props.resource.contentType,
  });
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
  link.download = props.resource.url.pathParts.slice(-1)[0];
  link.click();
}
</script>

<template>
  <Header sticky>{{ textEllipsis(resource.id, 64, { side: 'start' }) }}</Header>
  <div class="px-1">
    <p class="flex items-stretch">
      <span class="flex items-center text-secondary">
        {{ `${resource.status} ${getReasonPhrase(resource.status)}` }}
        &nbsp;-&nbsp;
        {{ filesize(resource.body.byteLength) }}
      </span>
      <span class="flex-grow"></span>
      <button
        v-if="resource.contentType !== undefined"
        v-for="(action, label) in { Open: onOpen, Download: onDownload }"
        @click="action"
        class="p-1 m-1 rounded text-primary bg-button hover:bg-button-hover"
      >
        {{ label }}
      </button>
    </p>

    <dl class="inline-grid grid-cols-[auto_1fr] gap-x-3">
      <dt class="text-secondary">Path</dt>
      <dd>{{ resource.url.path }}</dd>
      <template v-if="resource.url.origin !== undefined">
        <dt class="text-secondary">Origin</dt>
        <dd>
          {{ resource.url.origin }}
        </dd>
      </template>
    </dl>
  </div>

  <Header>Headers</Header>
  <div class="px-1">
    <i v-if="Object.keys(resource.headers).length === 0">None</i>
    <dl v-else class="inline-grid grid-cols-[auto_1fr] gap-x-3">
      <template v-for="(value, name) in resource.headers">
        <dt class="text-secondary">{{ name }}</dt>
        <dd>{{ value }}</dd>
      </template>
    </dl>
  </div>
</template>
