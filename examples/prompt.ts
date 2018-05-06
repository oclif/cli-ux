import {cli} from '../src'

const wait = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms))

async function run() {
  cli.action.start('doing a thing')
  await wait()
  let input = await cli.prompt('your name (normal)')
  cli.action.start('working')
  await wait()
  cli.log(`you entered: ${input}`)
  input = await cli.prompt('your name (mask)', {type: 'mask'})
  await wait()
  cli.log(`you entered: ${input}`)
  input = await cli.prompt('your name (hide)', {type: 'hide'})
  await wait()
  cli.log(`you entered: ${input}`)
  input = await cli.prompt('your name (default)', {default: 'somedefault'})
  await wait()
  cli.action.stop()
  cli.log(`you entered: ${input}`)
}
run().catch(err => cli.error(err))
