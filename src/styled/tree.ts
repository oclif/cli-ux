const treeify = require('treeify')

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
  display(opts: {logger: any, skipRootPrefix: boolean} = {logger: console.log, skipRootPrefix: false}) {
    const addNodes = function (nodes: any) {
      let tree: { [key: string]: any } = {}
      for (let p of Object.keys(nodes)) {
        tree[p] = addNodes(nodes[p].nodes)
      }
      return tree
    }

    let tree = addNodes(this.nodes)
    opts.logger(treeify.asTree(tree, true, true, opts.skipRootPrefix))
  }
}

export default function tree() {
  return new Tree()
}
