// 3pp
const cliProgress = require('cli-progress')

export default function progress(settings: any) {
  if (settings.multi && settings.multi === true) {
    return new cliProgress.MultiBar(settings)
  }
  return new cliProgress.SingleBar(settings)
}
