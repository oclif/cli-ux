import {expect, fancy} from 'fancy-mocha'

import * as fs from 'fs-extra'
import * as path from 'path'

import cli from '../src'

const log = path.join(__dirname, '../tmp/error.log')
const logLevel = cli.config.logLevel

beforeEach(() => {
  cli.config.logLevel = logLevel
  fs.removeSync(log)
  cli.config.errlog = log
})
afterEach(() => cli.config.errlog = undefined)

describe('logger', () => {
  fancy()
  .stdout()
  .stderr()
  .end('does nothing if no error.log', async () => {
    cli.config.errlog = undefined
    cli.info('foobar')
    await cli.done()
    expect(fs.pathExistsSync(log)).to.equal(false)
  })

  fancy()
  .stdout()
  .stderr()
  .end('writes stuff out', async () => {
    cli.warn('showwarning')
    cli.info('hideme')
    cli.error('showerror', {exit: false})
    await cli.done()
    expect(fs.readFileSync(log, 'utf8')).to.contain(' ERROR showerror')
  })

  fancy()
  .stdout()
  .stderr()
  .end('can change log level', async () => {
    cli.config.logLevel = 'debug'
    cli.warn('showwarning')
    cli.info('showme')
    cli.debug('hideme')
    cli.error('showerror', {exit: false})
    await cli.done()
    expect(fs.readFileSync(log, 'utf8')).to.contain(' ERROR showerror')
  })

  fancy()
  .stdout()
  .stderr()
  .end('uses scope', async () => {
    let _cli = cli.scope('mynewscope')
    _cli.warn('showwarning')
    _cli.info('hideme')
    _cli.error('showerror', {exit: false})
    await cli.done()
    expect(fs.readFileSync(log, 'utf8')).to.contain(' WARN mynewscope showwarning')
  })

  fancy()
  .stdout()
  .stderr()
  .end('does not create file if no output', async () => {
    cli.trace('mycontent')
    cli.debug('mycontent')
    cli.info('mycontent')
    await cli.done()
    expect(fs.pathExistsSync(log)).to.equal(false)
  })
})
