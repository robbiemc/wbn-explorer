<script setup lang="ts">
import { ref } from 'vue';

import { WebBundle } from './BundleReader';

import DropTarget from './components/DropTarget.vue';
import ResourceInfo from './components/ResourceInfo.vue';
import SidePanel from './components/SidePanel.vue';

const draggingOnPage = ref<boolean>(false);

const bundle = ref<WebBundle | undefined>();
const selected = ref<string | undefined>();
</script>

<template>
  <DropTarget :file-types="['.wbn', '.swbn']" v-model:dragging="draggingOnPage">
    <div class="container flex flex-row mx-auto">
      <aside class="w-full lg:w-1/3 xl:w-1/4 h-screen flex flex-col">
        <h1 class="py-2 text-2xl font-bold">Web Bundle Explorer</h1>
        <SidePanel
          :dragging-on-page="draggingOnPage"
          v-model:bundle="bundle"
          v-model:selected="selected"
        ></SidePanel>
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
