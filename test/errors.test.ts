import {describe, expect, it, output} from '@dxcli/dev-test'
import chalk from 'chalk'

import cli from '../src'

beforeEach(() => {
  chalk.enabled = false
})

describe.stderr('errors', () => {
  it('warns', () => {
    cli.warn('foobar')
    expect(output.stderr).to.equal(' ✖    foobar\n')
  })

  it('errors', () => {
    expect(() => cli.error('foobar')).to.throw(/foobar/)
  })
})
