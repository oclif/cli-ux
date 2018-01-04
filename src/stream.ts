import Config from './config'
import deps from './deps'

export default class StreamOutput {
  readonly stream: NodeJS.WriteStream

  public get output(): string {
    return this.type === 'stdout' ? Config.stdout : Config.stderr
  }

  constructor(readonly type: 'stdout' | 'stderr') {
    this.stream = process[type]
  }

  public write(msg?: string) {
    msg = msg || ''
    if (deps.config.mock) {
      let m = deps.stripAnsi(msg)
      if (this.type === 'stdout') Config.stdout += m
      else Config.stderr += m
    } else {
      this.stream.write(msg)
    }
  }
}
