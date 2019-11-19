// 3pp
const cliProgress = require('cli-progress')
const enum BarType {
  SingleBar = 'SingleBar',
  MultiBar = 'MultiBar'
}
export default function progress(type: string, settings: object) {
  if (type === BarType.MultiBar) {
    return new cliProgress.MultiBar(settings)
  } else if (type === BarType.SingleBar) {
    return new cliProgress.SingleBar(settings)
  }
}
