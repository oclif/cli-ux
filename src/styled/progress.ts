// 3pp
const cliProgress = require('cli-progress')
const enum BarType {
  SingleBar = 'SingleBar',
  MultiBar = 'MultiBar'
}
export default function progress(type: string, settings: object) {
  if (type === BarType.MultiBar) {
    return new cliProgress.MultiBar(settings)
  }
  if (type === BarType.SingleBar) {
    return new cliProgress.SingleBar(settings)
  }
  throw new Error(`${type} is not a valid progress bar type, use 'SingleBar', or 'MultiBar'`)
}
