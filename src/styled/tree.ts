const treeify = require('object-treeify')

export class Tree {
  nodes: { [key: string]: Tree } = {}
  constructor() { }

  insert(child: string, value: Tree = new Tree()): Tree {
    this.nodes[child] = value
    return this
  }

  search(key: string): Tree | undefined {
    for (let child of Object.keys(this.nodes)) {
      if (child === key) {
        return this.nodes[child]
      } else {
        let c = this.nodes[child].search(key)
        if (c) return c
      }
    }
  }

  // tslint:disable-next-line:no-console
  display(logger: any= console.log) {
    const addNodes = function (nodes: any) {
      let tree: { [key: string]: any } = {}
      for (let p of Object.keys(nodes)) {
        tree[p] = addNodes(nodes[p].nodes)
      }
      return tree
    }

    let tree = addNodes(this.nodes)
    logger(treeify(tree))
  }
}

export default function tree() {
  return new Tree()
}
