<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { URL as URL2 } from 'whatwg-url';

import { BundleReader, WebBundle } from './BundleReader';
import BundleChooser from './components/BundleChooser.vue';
import { TreeNode } from './components/Tree.vue';
import Tree from './components/Tree.vue';

const bundleFile = ref<File | undefined>();
const bundle = ref<WebBundle | undefined>();
const selected = ref<string | undefined>();

watch(bundleFile, async () => {
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

type MappedTreeNode = {
  id?: string;
  children?: { [key: string]: MappedTreeNode };
};

const bundleTree = computed(() => {
  if (bundle.value === undefined) {
    return undefined;
  }

  const mappedTree: MappedTreeNode = {};
  for (const url of bundle.value.contents.urls) {
    // TODO: Explain URL2 here
    const parsedUrl = new URL2(url, 'http://invalid') as URL;
    const pathParts = parsedUrl.pathname.split('/');
    // TODO: origin doesn't exist for non-standard schemes
    pathParts[0] = parsedUrl.hostname === 'invalid' ? '/' : parsedUrl.origin;
    if (pathParts.slice(-1)[0] === '') {
      pathParts.pop();
    }

    let parent = mappedTree;
    for (; pathParts.length > 0; pathParts.shift()) {
      if (parent.children === undefined) {
        parent.children = {};
      }
      const partName = pathParts[0];
      if (!(partName in parent.children)) {
        parent.children[partName] = {};
      }
      const child = parent.children[partName];
      if (pathParts.length === 1) {
        child.id = url;
      }
      parent = child;
    }
  }
  return unmapTreeNode(mappedTree);
});

function unmapTreeNode(mapped: MappedTreeNode): TreeNode[] {
  const nodes: TreeNode[] = [];
  for (const [name, child] of Object.entries(mapped.children || {})) {
    const node: TreeNode = {
      name,
      id: child.id,
    };
    if (child.children !== undefined) {
      node.children = unmapTreeNode(child);
    }
    nodes.push(node);
  }
  nodes.sort((a, b) => {
    // Folders first
    if ((a.children === undefined) !== (b.children === undefined)) {
      return (a.children === undefined) ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });
  return nodes;
}

function onNodeSelected(id: string) {
  console.log('NodeSelected', id);
  selected.value = id;
}
</script>

<template>
  <div class="container mx-auto">
    <div class="p-4 text-2xl font-bold">Web Bundle Explorer</div>
    <div class="p-4 flex flex-row flex-wrap">
      <aside class="w-full sm:w-1/3 md:w-1/4 sticky">
        <Tree
          v-if="bundleTree !== undefined"
          :nodes="bundleTree"
          :selected="selected"
          :expanded="true"
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
