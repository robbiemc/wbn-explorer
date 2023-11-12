import { WebBundle } from './BundleReader';
import { TreeNode } from './components/Tree.vue';

type MappedTreeNode = {
  id?: string;
  children?: { [key: string]: MappedTreeNode };
};

export function treeifyBundle(bundle: WebBundle) {
  const mappedTree: MappedTreeNode = {};
  for (const [id, metadata] of Object.entries(bundle.index)) {
    const pathParts = [...metadata.pathParts];
    if (metadata.query !== undefined) {
      pathParts.push(metadata.query); // already has a '?' prefix
    }
    pathParts.unshift(metadata.origin === undefined ? '/' : metadata.origin);

    let parent = mappedTree;
    while (pathParts.length > 0) {
      if (parent.children === undefined) {
        parent.children = {};
      }
      const partName = pathParts.shift() as string;
      if (!(partName in parent.children)) {
        parent.children[partName] = {};
      }
      const child = parent.children[partName];
      if (pathParts.length === 0) {
        child.id = id;
      }
      parent = child;
    }
  }
  return unmapTreeNode(mappedTree);
}

function unmapTreeNode(mapped: MappedTreeNode): TreeNode[] {
  const nodes: TreeNode[] = [];
  for (const [name, child] of Object.entries(mapped.children || {})) {
    const node: TreeNode = {
      name,
      id: child.id,
    };
    if (child.children !== undefined) {
      node.children = unmapTreeNode(child);
    }
    nodes.push(node);
  }
  nodes.sort((a, b) => {
    // Folders first
    if ((a.children === undefined) !== (b.children === undefined)) {
      return a.children === undefined ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });
  return nodes;
}