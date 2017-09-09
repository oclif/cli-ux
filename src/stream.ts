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
      // tslint:disable-next-line:no-console
      console.error(err)
    }
  }

  private static startOfLine = false

  public output = ''
  private logfile: string
  private displayTimestamps: boolean
  private mock: boolean

  constructor(readonly stream?: NodeJS.WriteStream, readonly options: IOptions = {}) {}

  public write(msg: string, options: { log?: boolean } = {}) {
    // const log = options.log !== false
    // if (log) this.writeLogFile(msg, this.constructor.startOfLine)
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

  public log(data: string, ...args: any[]) {
    let msg = data ? util.format(data, ...args) : ''
    msg += '\n'
    this.write(msg)
    // this.out.action.pause(() => this.write(msg))
  }

  private timestamp(msg: string): string {
    return `[${deps.moment().format()}] ${msg}`
  }

  // writeLogFile (msg: string, withTimestamp: boolean) {
  //   if (!this.logfile) return
  //   msg = withTimestamp ? this.timestamp(msg) : msg
  //   logToFile(msg, this.logfile)
  // }
}
