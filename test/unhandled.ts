import { cli } from '../src'

cli.handleUnhandleds()

// async function run() {
//   throw new Error('uh oh')
// }
// run()

throw new Error('unhandled')
