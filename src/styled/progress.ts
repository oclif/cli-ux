// 3pp
const cliProgress = require('cli-progress')

export default function progress(options: cliProgress.Options = {}): cliProgress.SingleBar {
  // set noTTYOutput for options
  options.noTTYOutput = options.noTTYOutput || Boolean(process.env.TERM === 'dumb' || !process.stdin.isTTY)

  return new cliProgress.SingleBar(options)
}
