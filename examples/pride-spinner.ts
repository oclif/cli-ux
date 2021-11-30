import cli from '../src'

function wait() {
  return new Promise(resolve => {
    setTimeout(resolve, 1000)
  })
}

async function run() {
  cli.prideAction.start('running')
  await wait()
  cli.action.stop()
}

run().catch(error => cli.error(error))
