<script setup lang="ts">
import { computed, ref } from 'vue';

import { Error } from './components/SidePane.vue';
import { INTEGRITY_BLOCK_ID } from './treeify-bundle';
import { WebBundle, bundleFileTypes } from './BundleReader';
import DropTarget from './components/DropTarget.vue';
import ErrorPane from './components/ErrorPane.vue';
import HomePane from './components/HomePane.vue';
import IntegrityBlockInfo from './components/IntegrityBlockPane.vue';
import PreviewPane from './components/PreviewPane.vue';
import ResourceInfo from './components/ResourceInfoPane.vue';
import SidePanel from './components/SidePane.vue';

const draggingOnPage = ref<boolean>(false);

const bundle = ref<WebBundle | undefined>();
const selectedId = ref<string | undefined>();
const error = ref<Error | undefined>();

const resource = computed(() => {
  if (bundle.value === undefined || selectedId.value === undefined) {
    return undefined;
  }
  return bundle.value.resources[selectedId.value];
});
</script>

<template>
  <DropTarget :file-types="bundleFileTypes" v-model:dragging="draggingOnPage">
    <div class="container flex lg:flex-row mx-auto">
      <aside
        class="sticky top-0 w-full lg:w-1/3 xl:w-1/4 h-screen flex flex-col"
      >
        <h1 class="py-2 text-2xl font-bold">Web Bundle Explorer</h1>
        <SidePanel
          :dragging-on-page="draggingOnPage"
          v-model:bundle="bundle"
          v-model:selected="selectedId"
          v-model:error="error"
        ></SidePanel>
      </aside>

      <main class="w-full lg:w-2/3 xl:w-3/4 ml-2">
        <ErrorPane v-if="error !== undefined" :error="error"></ErrorPane>
        <template v-else-if="resource !== undefined">
          <ResourceInfo :resource="resource"></ResourceInfo>
          <PreviewPane :resource="resource"></PreviewPane>
        </template>
        <IntegrityBlockInfo
          v-else-if="selectedId === INTEGRITY_BLOCK_ID && bundle !== undefined"
          :bundle="bundle"
        ></IntegrityBlockInfo>
        <HomePane v-else :bundle="bundle"></HomePane>
      </main>
    </div>
  </DropTarget>
</template>
