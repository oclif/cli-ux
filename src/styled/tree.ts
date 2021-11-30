const treeify = require('object-treeify')

export class Tree {
  nodes: { [key: string]: Tree } = {}

  insert(child: string, value: Tree = new Tree()): Tree {
    this.nodes[child] = value
    return this
  }

  search(key: string): Tree | undefined {
    for (const child of Object.keys(this.nodes)) {
      if (child === key) {
        return this.nodes[child]
      }

      const c = this.nodes[child].search(key)
      if (c) return c
    }
  }

  // tslint:disable-next-line:no-console
  display(logger: any = console.log) {
    const addNodes = function (nodes: any) {
      const tree: { [key: string]: any } = {}
      for (const p of Object.keys(nodes)) {
        tree[p] = addNodes(nodes[p].nodes)
      }

      return tree
    }

    const tree = addNodes(this.nodes)
    logger(treeify(tree))
  }
}

export default function tree() {
  return new Tree()
}
