import {expect, fancy} from 'fancy-test'

import cli from '../../src'

describe('styled/tree', () => {
  fancy
  .stdout()
  .end('shows the tree', output => {
    const tree = cli.tree()
    tree.insert('foo')
    tree.insert('bar')

    const subtree = cli.tree()
    subtree.insert('qux')
    tree.nodes.bar.insert('baz', subtree)

    tree.display()
    expect(output.stdout).to.equal(`├─ foo
└─ bar
   └─ baz
      └─ qux

`)
  })
})
