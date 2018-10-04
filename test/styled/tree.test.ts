import {expect, fancy} from 'fancy-test'

import cli from '../../src'

describe('styled/tree', () => {
  fancy
    .stdout()
    .end('show the tree', output => {
      let tree = cli.tree()
      tree.insert('foo')
      tree.insert('bar')
      tree.insert('baz', 'bar')
      tree.insert('qux', 'baz')
      tree.display()

      expect(output.stdout).to.equal(`├─ foo
└─ bar
   └─ baz
      └─ qux

`)
    })
})
