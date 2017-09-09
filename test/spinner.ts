import { cli } from '../src'

function wait() {
  return new Promise(resolve => setTimeout(resolve, 1000))
}

async function run() {
  cli.action.start('running')
  await wait()
  cli.action.stop()
}
run().catch(err => cli.error(err))
