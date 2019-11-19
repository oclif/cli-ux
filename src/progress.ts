// 3pp
const cliProgress = require('cli-progress')
const enum BarType {
  SingleBar = 'SingleBar',
  MultiBar = 'MultiBar'
}
export default class Progress {
  private progressBar: any

  constructor(type: string, settings: object) {
    if (type === BarType.MultiBar) {
      this.progressBar = new cliProgress.MultiBar(settings)
    } else if (type === BarType.SingleBar) {
      this.progressBar = new cliProgress.SingleBar(settings)
    }
    return this.progressBar
  }
  getProgressBar(): any {
    return this.progressBar
  }
}
