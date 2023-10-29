<script setup lang="ts">
import TreeNode from './TreeNode.vue';

export type TreeNode = {
  id: string,
  name: string,
  noIcon: boolean,
  children?: TreeNode[],
};

defineProps<{
  nodes: TreeNode[],
  indent?: number,
}>();

defineEmits<{
  (e: 'nodeSelected', id: string): void,
}>();
</script>

<template>
  <ul>
    <TreeNode v-for="node in nodes" :node="node" :indent="indent"></TreeNode>
  </ul>
</template>
