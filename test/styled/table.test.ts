import {describe, expect, it, output} from '@dxcli/dev-test'

import cli from '../../src'

describe.stdout('styled/table', () => {
  it('shows a table', () => {
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
