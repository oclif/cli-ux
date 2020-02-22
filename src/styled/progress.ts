// 3pp
const cliProgress = require('cli-progress')

export default function progress(options?: any): any {
  // if no options passed, create empty options
  if (!options) {
    options = {}
  }
  // set noTTYOutput for options
  const isTTY = Boolean(process.env.TERM !== 'dumb' && process.stdin.isTTY)
  options.noTTYOutput = !isTTY

  return new cliProgress.SingleBar(options)
}
