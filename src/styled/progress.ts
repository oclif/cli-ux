// 3pp
const cliProgress = require('cli-progress')

export default function progress(settings?: any): any {
  return new cliProgress.SingleBar(settings)
}
