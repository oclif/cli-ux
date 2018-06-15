import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const expect = chai.expect

import cli from '../src'

import {fancy} from './fancy'

describe('prompt', () => {
  fancy
  .stdout()
  .stderr()
  .end('requires input', async () => {
    const promptPromise = cli.prompt('Require input?')
    process.stdin.emit('data', '')
    process.stdin.emit('data', 'answer')
    const answer = await promptPromise
    await cli.done()
    expect(answer).to.equal('answer')
  })

  fancy
  .stdout()
  .stderr()
  .stdin('y')
  .end('confirm', async () => {
    const promptPromise = cli.confirm('yes/no?')
    const answer = await promptPromise
    await cli.done()
    expect(answer).to.equal(true)
  })

  fancy
  .stdout()
  .stderr()
  .stdin('n')
  .end('confirm', async () => {
    const promptPromise = cli.confirm('yes/no?')
    const answer = await promptPromise
    await cli.done()
    expect(answer).to.equal(false)
  })

  fancy
  .stdout()
  .stderr()
  .stdin('x')
  .end('gets anykey', async () => {
    const promptPromise = cli.anykey()
    const answer = await promptPromise
    await cli.done()
    expect(answer).to.equal('x')
  })

  fancy
  .stdout()
  .stderr()
  .end('does not require input', async () => {
      const promptPromise = cli.prompt('Require input?', {
        required: false
      })
      process.stdin.emit('data', '')
      const answer = await promptPromise
      await cli.done()
      expect(answer).to.equal(undefined)
  })

  fancy
  .stdout()
  .stderr()
  .it('timeouts with no input', async () => {
    await expect(cli.prompt('Require input?', {timeout: 1}))
      .to.eventually.be.rejectedWith('Prompt timeout')
  })
})
