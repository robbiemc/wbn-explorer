<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { BundleReader, WebBundle } from './BundleReader';
import BundleChooser from './components/BundleChooser.vue';
import Tree from './components/Tree.vue';

const bundleFile = ref<File | null>(null);
const bundle = ref<WebBundle | null>(null);

watch(bundleFile, async () => {
  if (bundleFile.value === null) {
    bundle.value = null;
    return;
  }
  const reader = new BundleReader(bundleFile.value);
  const readResult = await reader.read();
  if (typeof readResult === 'string') {
    // TODO: handle errors
    bundle.value = null;
    return;
  }
  bundle.value = readResult;
});

const nodes = [
  {
    id: 'id1',
    name: 'name1',
    children: [
      { id: 'id2', name: 'name2' },
      { id: 'id3', name: 'name3' },
    ],
  },
  {
    id: 'id4',
    name: 'name4',
  },
];

function onNodeSelected(id: string) {
  console.log('NodeSelected', id);
}
</script>

<template>
  <div class="container mx-auto">
    <div class="p-4 text-2xl font-bold">Web Bundle Explorer</div>
    <div class="p-4 flex flex-row flex-wrap">
      <aside class="w-full sm:w-1/3 md:w-1/4 sticky">
        <Tree
          v-if="bundle !== null"
          :nodes="nodes"
          @node-selected="onNodeSelected"
        ></Tree>
      </aside>
      <main class="w-full sm:w-2/3 md:w-3/4">
        <BundleChooser v-model:bundle-file="bundleFile"></BundleChooser>
      </main>
    </div>
  </div>
</template>

<style scoped></style>
