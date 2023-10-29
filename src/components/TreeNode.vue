<script setup lang="ts">
import { computed, ref } from 'vue';
import { TreeNode } from './Tree.vue';
import Tree from './Tree.vue';

// Icons: https://flowbite.com/icons/

const props = defineProps<{
  node: TreeNode;
  indent?: number;
}>();

const emit = defineEmits<{
  (e: 'nodeSelected', id: string): void;
}>();

const isExpanded = ref(false);
const isFolder = computed(() => props.node.children !== undefined);

function onClick() {
  if (isFolder.value) {
    isExpanded.value = !isExpanded.value;
  } else {
    emit('nodeSelected', props.node.id);
  }
}
</script>

<template>
  <li>
    <div @click="onClick" class="rounded hover:bg-slate-700 cursor-pointer">
      <span
        class="inline-block"
        :style="`width: ${(indent || 0) * 0.75}rem`"
      ></span>

      <span class="inline-block p-1">
        <!-- Folder arrow -->
        <svg
          v-if="isFolder"
          :class="{ 'rotate-90': isExpanded }"
          class="inline-block mr-2 w-3 h-3 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 6 10"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 9 4-4-4-4"
          />
        </svg>
        <span v-else class="inline-block mr-2 w-3"></span>

        <!-- Icon -->
        <span v-if="node.noIcon" class="inline-block w-4"></span>
        <svg
          v-else-if="isFolder"
          class="inline-block w-4 h-4 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 18 18"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M1 5v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H1Zm0 0V2a1 1 0 0 1 1-1h5.443a1 1 0 0 1 .8.4l2.7 3.6H1Z"
          />
        </svg>
        <svg
          v-else
          class="inline-block w-4 h-4 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 16 20"
        >
          <path
            stroke="currentColor"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"
          />
        </svg>

        {{ node.name }}
      </span>
    </div>
    <Tree
      v-if="isFolder && isExpanded"
      :nodes="node.children as TreeNode[]"
      :indent="(indent || 0) + 1"
    ></Tree>
  </li>
</template>
