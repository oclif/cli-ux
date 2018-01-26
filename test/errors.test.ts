import cli from '../src'

import {expect, fancy} from './fancy'

describe('errors', () => {
  fancy
  .stderr()
  .end('warns', async output => {
    cli.warn('foobar')
    expect(output.stderr).to.equal(' ▸    foobar\n')
  })

  fancy
  .end('errors', async () => {
    expect(() => cli.error('foobar')).to.throw(/foobar/)
  })
})
