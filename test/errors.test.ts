import chalk from 'chalk'
import {expect, fancy} from 'fancy-mocha'

import cli from '../src'

beforeEach(() => {
  chalk.enabled = false
})

describe('errors', () => {
  fancy()
  .stderr()
  .it('warns', output => {
    cli.warn('foobar')
    expect(output.stderr).to.equal(' ▸    foobar\n')
  })

  fancy()
  .it('errors', () => {
    expect(() => cli.error('foobar')).to.throw(/foobar/)
  })
})
