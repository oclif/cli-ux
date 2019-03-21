import {expect, fancy} from 'fancy-test'

import cli from '../../src'

describe('styled/tree', () => {
  fancy
    .stdout()
    .end('shows the tree', output => {
      let tree = cli.tree()
      tree.insert('foo')
      tree.insert('bar')

      let subtree = cli.tree()
      subtree.insert('qux')
      tree.nodes.bar.insert('baz', subtree)

      tree.display()
      expect(output.stdout).to.equal(`├─ bar
│  └─ baz
│     └─ qux
└─ foo
`)
    })
})
