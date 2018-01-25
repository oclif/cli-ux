import {expect, fancy} from 'fancy-mocha'

import cli from '../../src'

describe('styled/table', () => {
  fancy()
  .stdout()
  .end('shows a table', output => {
    cli.table([
      {foo: 1, bar: 1},
      {foo: 2, bar: 2},
      {foo: 3, bar: 3},
    ], {
      columns: [
        {key: 'bar'},
        {key: 'foo'},
      ]
    })
    expect(output.stdout).to.equal(`bar  foo
───  ───
1    1
2    2
3    3
`)
  })
})
