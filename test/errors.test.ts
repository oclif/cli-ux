import cli from '../src'

import {expect, fancy} from './fancy'

describe('errors', () => {
  fancy
  .env({CI: null})
  .stderr()
  .it('warns', async output => {
    cli.warn('foobar')
    if (process.platform === 'win32') {
      expect(output.stderr).to.equal(' !    Warning: foobar\n')
    } else {
      expect(output.stderr).to.equal(' ▸    Warning: foobar\n')
    }
  })

  fancy
  .env({CI: null})
  .stderr()
  .it('warns with context', async output => {
    cli.config.context = {foo: 'bar'}
    cli.warn('foobar')
    if (process.platform === 'win32') {
      expect(output.stderr).to.equal(' !    Warning: foobar\n !\n !    foo: bar\n')
    } else {
      expect(output.stderr).to.equal(' ▸    Warning: foobar\n ▸\n ▸    foo: bar\n')
    }
  })

  fancy
  .env({CI: null})
  .it('errors', async () => {
    expect(() => cli.error('foobar')).to.throw(/foobar/)
  })
})
