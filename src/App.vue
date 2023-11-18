<script setup lang="ts">
import { computed, ref } from 'vue';

import textEllipsis from 'text-ellipsis';

import { WebBundle, bundleFileTypes } from './BundleReader';
import DropTarget from './components/DropTarget.vue';
import ResourceInfo from './components/ResourceInfo.vue';
import SidePanel from './components/SidePanel.vue';
import PreviewPane from './components/PreviewPane.vue';

const draggingOnPage = ref<boolean>(false);

const bundle = ref<WebBundle | undefined>();
const selectedId = ref<string | undefined>();

const resource = computed(() => {
  if (bundle.value === undefined || selectedId.value === undefined) {
    return undefined;
  }
  return bundle.value.resources[selectedId.value];
});
</script>

<template>
  <DropTarget :file-types="bundleFileTypes" v-model:dragging="draggingOnPage">
    <div class="container flex flex-row mx-auto">
      <aside
        class="sticky top-0 w-full lg:w-1/3 xl:w-1/4 h-screen flex flex-col"
      >
        <h1 class="py-2 text-2xl font-bold">Web Bundle Explorer</h1>
        <SidePanel
          :dragging-on-page="draggingOnPage"
          v-model:bundle="bundle"
          v-model:selected="selectedId"
        ></SidePanel>
      </aside>
      <main class="w-full lg:w-2/3 xl:w-3/4 ml-2">
        <template v-if="resource !== undefined">
          <div class="sticky top-0">
            <h1 class="py-2 text-2xl font-bold bg-slate-900">&nbsp;</h1>
            <h2
              class="p-1 border-b font-bold dark:border-slate-600 bg-slate-900"
            >
              {{ textEllipsis(selectedId, 64, { side: 'start' }) }}
            </h2>
          </div>
          <ResourceInfo :resource="resource"></ResourceInfo>
          <PreviewPane :resource="resource"></PreviewPane>
        </template>
      </main>
    </div>
  </DropTarget>
</template>
