<script setup lang="ts">
import { WebBundle } from '../BundleReader';
import Header from './Header.vue';

defineProps<{
  bundle?: WebBundle;
}>();
</script>

<template>
  <template v-if="bundle === undefined">
    <Header sticky>No file selected</Header>
    <p class="p-1">
      This page lets you view the contents of a
      <a
        target="_blank"
        class="underline"
        href="https://wicg.github.io/webpackage/draft-yasskin-dispatch-web-packaging.html"
        >Web Bundle</a
      >, a packaging format used to bundle web resources into a single file,
      including headers.
    </p>
    <p class="p-1">
      Drag a *.wbn or *.swbn file onto the page, or click the folder icon to the
      left to select one.
    </p>
  </template>
  <template v-else>
    <Header sticky>No resource selected</Header>
  </template>
</template>
