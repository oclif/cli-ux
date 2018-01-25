import {expect, fancy} from 'fancy-mocha'

import cli from '../../src'

describe('styled/table', () => {
  fancy()
  .stdout()
  .it('shows a table', output => {
    cli.styledObject([
      {foo: 1, bar: 1},
      {foo: 2, bar: 2},
      {foo: 3, bar: 3},
    ])
    expect(output.stdout).to.equal(`0: foo: 1, bar: 1
1: foo: 2, bar: 2
2: foo: 3, bar: 3
`)
  })
})
