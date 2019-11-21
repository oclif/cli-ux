import {cli} from '../src'

const wait = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms))

async function run() {
  cli.action.start('doing a thing')
  await wait()
  const input = await cli.confirm('yes or no')
  await wait()
  cli.log(`you entered: ${input}`)
}
run().catch(error => cli.error(error))
