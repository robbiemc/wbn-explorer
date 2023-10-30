<script setup lang="ts">
import TreeNode from './TreeNode.vue';

export type TreeNode = {
  name: string;
  id?: string;
  noIcon?: boolean;
  children?: TreeNode[];
};

defineProps<{
  nodes: TreeNode[];
  selected?: string;
  expanded?: boolean;
  indent?: number;
}>();

const emit = defineEmits<{
  (e: 'nodeSelected', id: string): void;
}>();
</script>

<template>
  <ul>
    <TreeNode
      v-for="node in nodes"
      :node="node"
      :selected="selected"
      :expanded="expanded"
      :indent="indent"
      @node-selected="(id) => emit('nodeSelected', id)"
    ></TreeNode>
  </ul>
</template>
