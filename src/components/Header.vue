<script setup lang="ts">
defineProps<{
  sticky?: boolean;
}>();
</script>
<template>
  <div v-if="sticky" class="sticky top-0">
    <h1 class="py-2 text-2xl font-bold bg-slate-900">&nbsp;</h1>
    <h2 class="flex p-1 border-b font-bold bg-slate-900 dark:border-slate-600">
      <slot></slot>
    </h2>
  </div>
  <h2 v-else class="flex p-1 my-3 border-b font-bold dark:border-slate-600">
    <slot></slot>
  </h2>
</template>
