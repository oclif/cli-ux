import * as fs from 'fs-extra'

import cli from '../src'

import {expect, fancy} from './fancy'

describe('logger', () => {
  fancy
  .stdout()
  .end('does nothing if no error.log', async () => {
    cli.config.errlog = undefined
    cli.info('foobar')
    await cli.done()
  })

  fancy
  .stdout()
  .stderr()
  .end('writes stuff out', async () => {
    cli.warn('showwarning')
    cli.info('hideme')
    cli.error('showerror', {exit: false})
    await cli.done()
    expect(fs.readFileSync(cli.config.errlog!, 'utf8')).to.contain(' ERROR showerror')
  })

  fancy
  .stdout()
  .stderr()
  .end('can change log level', async () => {
    cli.config.logLevel = 'debug'
    cli.warn('showwarning')
    cli.info('showme')
    cli.debug('hideme')
    cli.error('showerror', {exit: false})
    await cli.done()
    expect(fs.readFileSync(cli.config.errlog!, 'utf8')).to.contain(' ERROR showerror')
  })

  fancy
  .stdout()
  .stderr()
  .end('uses scope', async () => {
    let _cli = cli.scope('mynewscope')
    _cli.warn('showwarning')
    _cli.info('hideme')
    _cli.error('showerror', {exit: false})
    await cli.done()
    expect(fs.readFileSync(cli.config.errlog!, 'utf8')).to.contain(' WARN mynewscope showwarning')
  })

  fancy
  .stdout()
  .stderr()
  .end('does not create file if no output', async () => {
    cli.trace('mycontent')
    cli.debug('mycontent')
    cli.info('mycontent')
    await cli.done()
    expect(fs.pathExistsSync(cli.config.errlog!)).to.equal(false)
  })
})
