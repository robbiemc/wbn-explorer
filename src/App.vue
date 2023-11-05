<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { BundleReader, WebBundle } from './BundleReader';
import BundleChooser from './components/BundleChooser.vue';
import ResourceInfo from './components/ResourceInfo.vue';
import { TreeNode } from './components/Tree.vue';
import Tree from './components/Tree.vue';

const bundleFile = ref<File | undefined>();
const bundle = ref<WebBundle | undefined>();
const selected = ref<string | undefined>();

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

type MappedTreeNode = {
  id?: string;
  children?: { [key: string]: MappedTreeNode };
};

const bundleTree = computed(() => {
  if (bundle.value === undefined) {
    return undefined;
  }

  const mappedTree: MappedTreeNode = {};
  for (const [id, metadata] of Object.entries(bundle.value.index)) {
    const pathParts = [...metadata.pathParts];
    if (metadata.query !== undefined) {
      pathParts.push(metadata.query); // already has a '?' prefix
    }
    pathParts.unshift(metadata.origin === undefined ? '/' : metadata.origin);

    let parent = mappedTree;
    while (pathParts.length > 0) {
      if (parent.children === undefined) {
        parent.children = {};
      }
      const partName = pathParts.shift() as string;
      if (!(partName in parent.children)) {
        parent.children[partName] = {};
      }
      const child = parent.children[partName];
      if (pathParts.length === 0) {
        child.id = id;
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
      return a.children === undefined ? 1 : -1;
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
  <div class="container min-h-screen mx-auto">
    <h1 class="px-3 py-2 text-2xl font-bold">Web Bundle Explorer</h1>
    <div class="flex flex-row">
      <aside class="px-3 py-2 w-full sm:w-1/3 lg:w-1/4">
        <h2 v-if="bundle !== undefined">{{bundle.filename}}</h2>
        <div class="">
          <Tree
            v-if="bundleTree !== undefined"
            :nodes="bundleTree"
            :selected="selected"
            :expanded="true"
            @node-selected="onNodeSelected"
          ></Tree>
        </div>
      </aside>
      <main class="px-3 py-2 w-full sm:w-2/3 lg:w-3/4">
        <h2>Selected file path</h2>
        <div class="">
          <ResourceInfo
            v-if="bundle !== undefined && selected !== undefined"
            :bundle="bundle"
            :url="selected"
          ></ResourceInfo>
          <BundleChooser
            v-else
            v-model:bundle-file="bundleFile"
          ></BundleChooser>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped></style>
