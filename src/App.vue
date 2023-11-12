<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { BundleReader, WebBundle } from './BundleReader';
import { treeifyBundle } from './treeify-bundle';

import DropTarget from './components/DropTarget.vue';
import ResourceInfo from './components/ResourceInfo.vue';
import SvgIcon from './components/SvgIcon.vue';
import Tree from './components/Tree.vue';

const bundleTypes = ['.wbn', '.swbn'];

const draggingOnPage = ref<boolean>(false);
const draggingOnTree = ref<boolean>(false);
const expandTree = ref<boolean>(true);

const bundleFile = ref<File | undefined>();
const bundle = ref<WebBundle | undefined>();
const selected = ref<string | undefined>();

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
  selected.value = undefined;
  if (bundleFile.value === undefined) {
    bundle.value = undefined;
    return;
  }
  const reader = new BundleReader(bundleFile.value);
  const readResult = await reader.read();
  if (typeof readResult === 'string') {
    // TODO: handle errors
    bundle.value = undefined;
    return;
  }
  bundle.value = readResult;
});

const bundleTree = computed(() => {
  if (bundle.value === undefined) {
    return undefined;
  }
  return treeifyBundle(bundle.value);
});
</script>

<template>
  <DropTarget :file-types="bundleTypes" v-model:dragging="draggingOnPage">
    <div class="container flex flex-row mx-auto">
      <aside class="w-full lg:w-1/3 xl:w-1/4 h-screen flex flex-col">
        <h1 class="py-2 text-2xl font-bold">Web Bundle Explorer</h1>
        <div
          class="p-1 flex gap-1 items-stretch border-b dark:border-slate-600"
        >
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
            <b v-if="bundle !== undefined" class="text-l">{{
              bundle.filename
            }}</b>
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
        </div>
        <DropTarget
          :file-types="bundleTypes"
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
            :selected="selected"
            :expanded="expandTree"
            @node-selected="(id) => (selected = id)"
          ></Tree>
        </DropTarget>
      </aside>
      <main class="w-full lg:w-2/3 xl:w-3/4">
        <h1 class="py-2 text-2xl font-bold"><!-- Spacing -->&nbsp;</h1>
        <h2>Selected file path</h2>
        <div class="">
          <ResourceInfo
            v-if="bundle !== undefined && selected !== undefined"
            :bundle="bundle"
            :url="selected"
          ></ResourceInfo>
        </div>
      </main>
    </div>
  </DropTarget>
</template>

<style scoped></style>
