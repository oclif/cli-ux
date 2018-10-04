const treeify = require('treeify')

export class Tree {
  nodes: { [key: string]: Tree } = {}
  constructor() { }

  insert(child: string, parent?: string): boolean {
    // if not parent, at root tree
    if (!parent) {
      this.nodes[child] = new Tree()
      return true
    }
    // if already inserted, return
    if (this.search(child)) return true
    // find parent
    let node = this.search(parent)
    // and insert
    if (node) {
      node.insert(child)
      return true
    }
    return false
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
  display(opts: { logger: any, skipRootPrefix: boolean } = {logger: console.log, skipRootPrefix: false}) {
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
