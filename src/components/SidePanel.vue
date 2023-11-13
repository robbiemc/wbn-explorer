<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { BundleReader, WebBundle, bundleFileTypes } from '../BundleReader';
import { treeifyBundle } from '../treeify-bundle';

import DropTarget from './DropTarget.vue';
import SvgIcon from './SvgIcon.vue';
import Tree from './Tree.vue';

const props = defineProps<{
  bundle?: WebBundle;
  selected?: string;
  draggingOnPage: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:bundle', bundle?: WebBundle): void;
  (e: 'update:selected', id?: string): void;
}>();

const draggingOnTree = ref<boolean>(false);
const expandTree = ref<boolean>(true);

const bundleFile = ref<File | undefined>();

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files as FileList;
  // TODO: handle multiple files
  bundleFile.value = files[0];
}

function onDrop(files: File[]) {
  if (files.length != 1) {
    // TODO: handle multiple files
    return;
  }
  bundleFile.value = files[0];
}

watch(bundleFile, async () => {
  emit('update:selected', undefined);
  if (bundleFile.value === undefined) {
    emit('update:bundle', undefined);
    return;
  }
  const reader = new BundleReader(bundleFile.value);
  const readResult = await reader.read();
  if (typeof readResult === 'string') {
    // TODO: handle errors
    emit('update:bundle', undefined);
    return;
  }
  emit('update:bundle', readResult);
});

const bundleTree = computed(() => {
  if (props.bundle === undefined) {
    return undefined;
  }
  return treeifyBundle(props.bundle);
});
</script>

<template>
  <h2 class="p-1 flex gap-1 items-stretch border-b dark:border-slate-600">
    <label class="flex px-1 rounded hover:bg-slate-500 cursor-pointer">
      <SvgIcon class="inline w-4" type="folder_open"></SvgIcon>
      <input
        class="hidden"
        type="file"
        accept=".wbn,.swbn"
        @change="onFileSelected"
      />
    </label>
    <h2>
      <b v-if="bundle !== undefined" class="text-l">{{ bundle.filename }}</b>
      <i v-else>Select a .wbn/.swbn file</i>
    </h2>
    <span class="flex-grow"><!-- padding --></span>
    <button
      v-if="bundle !== undefined"
      class="flex px-1 rounded hover:bg-slate-500"
      @click="expandTree = true"
    >
      <SvgIcon class="inline w-4" type="plus"></SvgIcon>
    </button>
    <button
      v-if="bundle !== undefined"
      class="flex px-1 rounded hover:bg-slate-500"
      @click="expandTree = false"
    >
      <SvgIcon class="inline w-4" type="minus"></SvgIcon>
    </button>
  </h2>
  <DropTarget
    :file-types="bundleFileTypes"
    v-model:dragging="draggingOnTree"
    @drop="onDrop"
    class="flex-grow overflow-y-auto border-dashed border-4"
    :class="{
      'border-transparent': !draggingOnPage,
      'border-slate-600': draggingOnPage,
      'bg-slate-700': draggingOnPage && !draggingOnTree,
      'bg-slate-600': draggingOnTree,
    }"
  >
    <Tree
      v-if="bundleTree !== undefined"
      :nodes="bundleTree"
      :selected-id="selected"
      :expanded="expandTree"
      @node-selected="(id) => emit('update:selected', id)"
    ></Tree>
  </DropTarget>
</template>
