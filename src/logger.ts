import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as path from 'path'
import Rx = require('rxjs/Rx')

import {CLI} from '.'
import {config} from './config'
import {ConfigMessage, LoggerMessage, Message} from './message'

const timestamp = () => new Date().toISOString()

export default function setup(cli: CLI): Rx.Observable<any> {
  function log(file: string) {
    let stream: Promise<fs.WriteStream> | undefined
    function getStream() {
      return stream = stream || (async () => {
        await fs.mkdirp(path.dirname(file))
        return fs.createWriteStream(file, {flags: 'a+', encoding: 'utf8'})
      })()
    }

    async function write(lines: string[]): Promise<string[]> {
      const stream = await getStream()
      return new Promise<string[]>((resolve, reject) => {
        stream.write(lines.join('\n') + '\n', (err: any) => err ? reject(err) : resolve(lines))
      })
    }

    async function close() {
      if (!stream) return
      const s = await stream
      return new Promise<void>((resolve, reject) => {
        s.end((err: Error) => err ? reject(err) : resolve())
        stream = undefined
      })
    }

    if (!file) return Rx.Observable.empty()

    const messages$ = cli
      .takeUntil(cli.filter(m => m.type === 'done'))
      .filter<Message, LoggerMessage>((m): m is LoggerMessage => m.type === 'logger')
      .filter(m => {
        switch (config.logLevel) {
          case 'error': return ['fatal', 'error'].includes(m.severity)
          case 'warn': return ['fatal', 'error', 'warn'].includes(m.severity)
          case 'info': return ['fatal', 'error', 'warn', 'info'].includes(m.severity)
          case 'debug': return ['fatal', 'error', 'warn', 'info', 'debug'].includes(m.severity)
          case 'trace': return ['fatal', 'error', 'warn', 'info', 'debug', 'trace'].includes(m.severity)
          default: return false
        }
      })
      .map(m => _([timestamp(), m.severity.toUpperCase(), cli.scope, m.message]).compact().join(' '))
    return messages$
      .bufferWhen(() => messages$.delay(10))
      .filter(lines => lines.length > 0)
      .concatMap(lines => write(lines))
      .catch((err, caught) => {
        // tslint:disable no-console
        console.error(err)
        return caught
      })
      .finally(close)
  }

  return cli
  .takeUntil(cli.filter(m => m.type === 'done'))
  .startWith({type: 'config', prop: 'errlog', value: cli.config.errlog})
  .filter<Message, ConfigMessage>((m): m is ConfigMessage => m.type === 'config' && m.prop === 'errlog')
  .switchMap(m => log(m.value))
}
