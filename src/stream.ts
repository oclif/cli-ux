import * as fs from 'fs-extra'
import * as path from 'path'
import * as util from 'util'
import { deps } from './deps'

export interface IOptions {
  displayTimestamps?: boolean
}

export class StreamOutput {
  public static logToFile(msg: string, logfile: string) {
    try {
      fs.mkdirpSync(path.dirname(logfile))
      fs.appendFileSync(logfile, deps.stripAnsi(msg))
    } catch (err) {
      console.error(err)
    }
  }

  private static startOfLine = false

  public logfile: string | undefined
  public output = ''
  private displayTimestamps: boolean
  private mock: boolean

  constructor(readonly stream?: NodeJS.WriteStream, readonly options: IOptions = {}) {}

  public write(msg?: string, options: { log?: boolean } = {}) {
    msg = msg || ''
    const log = options.log !== false
    if (log) this.writeLogFile(msg, StreamOutput.startOfLine)
    // conditionally show timestamp if configured to display
    if (StreamOutput.startOfLine && this.displayTimestamps) {
      msg = this.timestamp(msg)
    }
    if (this.stream) {
      this.stream.write(msg)
    } else {
      this.output += deps.stripAnsi(msg)
    }
    StreamOutput.startOfLine = msg.endsWith('\n')
  }

  public log(data?: string, ...args: any[]) {
    let msg = data ? util.format(data, ...args) : ''
    msg += '\n'
    this.write(msg)
  }

  public writeLogFile(msg: string, withTimestamp: boolean) {
    if (!this.logfile) {
      return
    }
    msg = withTimestamp ? this.timestamp(msg) : msg
    StreamOutput.logToFile(msg, this.logfile)
  }

  private timestamp(msg: string): string {
    return `[${deps.moment().format()}] ${msg}`
  }
}
