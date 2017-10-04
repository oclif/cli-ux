import * as path from 'path'
import * as util from 'util'
import { Config } from './config'
import stripAnsi = require('strip-ansi')
import * as fs from 'fs-extra'
import * as moment from 'moment'

export class StreamOutput {
  public static logToFile(msg: string, logfile: string) {
    try {
      fs.mkdirpSync(path.dirname(logfile))
      fs.appendFileSync(logfile, stripAnsi(msg))
    } catch (err) {
      console.error(err)
    }
  }

  private static startOfLine = false

  public get output(): string {
    return this.type === 'stdout' ? Config.stdout : Config.stderr
  }

  constructor(readonly type: 'stdout' | 'stderr', readonly stream: NodeJS.WriteStream) {}

  public write(msg?: string, options: { log?: boolean } = {}) {
    msg = msg || ''
    const log = options.log !== false
    if (log) this.writeLogFile(msg, StreamOutput.startOfLine)
    // conditionally show timestamp if configured to display
    if (StreamOutput.startOfLine && Config.displayTimestamps) {
      msg = this.timestamp(msg)
    }
    if (Config.mock) {
      let m = stripAnsi(msg)
      if (this.type === 'stdout') Config.stdout += m
      else Config.stderr += m
    } else {
      this.stream.write(msg)
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

  public get logfile(): string | undefined {
    if (this.type === 'stderr') return Config.errlog
  }

  private timestamp(msg: string): string {
    return `[${moment().format()}] ${msg}`
  }
}
