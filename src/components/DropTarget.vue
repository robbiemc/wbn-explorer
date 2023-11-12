<script setup lang="ts">
const props = defineProps<{
  fileTypes: string[];
}>();

const emit = defineEmits<{
  (e: 'drop', files: File[]): void;
  (e: 'update:dragging', dragging: boolean): void;
}>();

let enterCount = 0;

function onEnter() {
  if (++enterCount === 1) {
    emit('update:dragging', true);
  }
}

function onLeave() {
  if (--enterCount === 0) {
    emit('update:dragging', false);
  }
}

function getMatchingFiles(files: FileList): File[] | undefined {
  const matches: File[] = [];
  for (const file of files) {
    if (props.fileTypes.some((type) => file.name.endsWith(type))) {
      matches.push(file);
    }
  }
  return matches.length > 0 ? matches : undefined;
}

function onDrop(event: DragEvent) {
  onLeave();
  if (event.dataTransfer?.files === undefined) {
    return;
  }
  const matches = getMatchingFiles(event.dataTransfer.files);
  if (matches !== undefined) {
    emit('drop', matches);
  }
}
</script>

<template>
  <div
    @dragover.prevent=""
    @dragenter="onEnter"
    @dragleave="onLeave"
    @drop.prevent="onDrop"
  >
    <slot></slot>
  </div>
</template>
