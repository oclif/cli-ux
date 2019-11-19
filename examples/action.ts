// tslint:disable
import cli from '../src'
import SimpleAction from '../src/action/simple'

const wait = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms))

async function run() {
  cli.action.start('x foo')
  await wait()
  cli.log('1 log')
  await wait()
  cli.action.status = 'a wild status appeared!'
  await wait()
  cli.log('2 log')
  await wait()
  cli.log('3 log')
  await wait()
  cli.action.start('4 bar')
  await wait()
  cli.action.stop('now it is done')
  await wait()
  cli.action.start('x hideme')
  await wait()
  cli.action.start('5 foo')
  await wait()
  process.stderr.write('partial')
  await wait()
  cli.action.stop()
  await wait()
  cli.action.start('6 warn')
  await wait()
  cli.warn('uh oh')
  await wait()
  cli.action.stop()
  await wait()
}

async function main() {
  console.log('SPINNER')
  console.log('=======')
  await run()

  console.log('\nSIMPLE')
  console.log('======')
  process.env.TERM = 'dumb'
  cli.config.action = new SimpleAction()
  await run()

  console.log('\nERROR')
  console.log('=====')
  cli.action.start('7 error out')
  await wait()
  cli.error('oh no')
}
main()
.catch(error => require('@oclif/errors/handle')(error))
