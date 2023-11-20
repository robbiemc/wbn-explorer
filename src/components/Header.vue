<script setup lang="ts">
defineProps<{
  sticky?: boolean;
}>();
</script>
<template>
  <div v-if="sticky" class="sticky top-0">
    <h1 class="py-2 text-2xl font-bold bg-background">&nbsp;</h1>
    <h2 class="flex p-1 border-b font-bold bg-background border-divider">
      <slot></slot>
    </h2>
  </div>
  <h2 v-else class="flex p-1 my-3 border-b font-bold border-divider">
    <slot></slot>
  </h2>
</template>
