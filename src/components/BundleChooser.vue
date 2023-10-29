<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['update:bundleFile']);

const hasDrag = ref(false);

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files as FileList;
  emit('update:bundleFile', files[0]);
}

function onFileDropped(event: DragEvent) {
  hasDrag.value = false;
  const files = event.dataTransfer?.files as FileList;
  // TODO: Check that only one file was dropped.
  emit('update:bundleFile', files[0]);
}
</script>

<template>
  <div class="min-w-[30em] w-1/3 mx-auto">
    <div  class="p-8 text-xl rounded-xl border-slate-600 border-4 border-dashed"
          :class="hasDrag && 'bg-slate-600' || 'bg-slate-700'"
          @dragover.prevent=""
          @dragenter.prevent="hasDrag = true"
          @dragleave.prevent="hasDrag = false"
          @drop.prevent=onFileDropped>
      <label>
        <span class="underline cursor-pointer text-indigo-300">Select a .wbn/.swbn file</span>
        <input  class="hidden"
                type="file"
                accept=".wbn,.swbn"
                @change=onFileSelected>
      </label>
      or drag one here.
    </div>
  </div>
</template>

<style scoped>
</style>
