import { WebBundle } from './BundleReader';
import { TreeNode } from './components/Tree.vue';

export const INTEGRITY_BLOCK_ID = '~integrity_block~';

type MappedTreeNode = {
  id?: string;
  children?: { [key: string]: MappedTreeNode };
};

export function treeifyBundle(bundle: WebBundle) {
  const mappedTree: MappedTreeNode = {};
  for (const [id, resource] of Object.entries(bundle.resources)) {
    const pathParts = [...resource.url.pathParts];
    if (resource.url.query !== undefined) {
      pathParts.push(resource.url.query); // already has a '?' prefix
    }
    pathParts.unshift(resource.url.origin ?? '/');

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
  const nodes = unmapTreeNode(mappedTree);
  if (bundle.integrityBlock !== undefined) {
    nodes.unshift({
      id: INTEGRITY_BLOCK_ID,
      name: 'Integrity Block',
      noIcon: true,
    });
  }
  return nodes;
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
