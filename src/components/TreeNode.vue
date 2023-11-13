<script setup lang="ts">
import { computed, toRef, watch } from 'vue';

import SvgIcon from './SvgIcon.vue';
import { TreeNode } from './Tree.vue';
import Tree from './Tree.vue';

// Icons: https://flowbite.com/icons/

const props = defineProps<{
  node: TreeNode;
  selectedId?: string;
  expanded?: boolean;
  indent?: number;
}>();

const emit = defineEmits<{
  (e: 'nodeSelected', id: string): void;
}>();

const isExpanded = toRef(false);
const isFolder = computed(() => props.node.children !== undefined);

const expandedProp = computed(() => props.expanded);
watch(
  expandedProp,
  (expanded) => {
    isExpanded.value = expanded;
  },
  { immediate: true },
);
</script>

<template>
  <li>
    <div
      @click="props.node.id && emit('nodeSelected', props.node.id)"
      class="flex gap-2 items-stretch rounded border border-transparent"
      :class="
        node.id
          ? 'text-slate-50 hover:bg-slate-600 cursor-pointer'
          : 'text-slate-400 hover:border-slate-500 cursor-default'
      "
    >
      <span
        class="flex-shrink-0"
        :style="`width: ${(indent || 0) * 0.75}rem`"
      ></span>

      <!-- Folder arrow -->
      <span
        class="flex-shrink-0 flex items-center justify-center w-5 mr-1 cursor-pointer"
        :class="{ 'hover:bg-slate-500': isFolder }"
        @click.stop="isExpanded = !isExpanded"
      >
        <SvgIcon
          v-if="isFolder"
          :class="{ 'rotate-90': isExpanded }"
          class="inline w-3 h-3"
          type="caret"
        ></SvgIcon>
      </span>

      <!-- Icon -->
      <span v-if="node.noIcon" class="flex-shrink-0 inline-block w-4"></span>
      <SvgIcon
        v-else-if="isFolder"
        class="flex-shrink-0 inline w-4"
        type="folder_closed"
      ></SvgIcon>
      <SvgIcon
        v-else
        class="flex-shrink-0 inline-block w-4"
        type="file"
      ></SvgIcon>

      <span
        class="py-1 whitespace-nowrap overflow-hidden overflow-ellipsis"
        :class="{ 'font-bold': selectedId !== undefined && selectedId === node.id }"
      >
        {{ node.name }}
      </span>
    </div>

    <Tree
      v-if="isFolder"
      v-show="isExpanded"
      :nodes="node.children as TreeNode[]"
      :selected-id="selectedId"
      :expanded="expanded"
      :indent="(indent || 0) + 1"
      @node-selected="(id) => emit('nodeSelected', id)"
    ></Tree>
  </li>
</template>
