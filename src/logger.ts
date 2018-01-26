import * as fs from 'fs-extra'
import * as _ from 'lodash'
import * as path from 'path'

import {config} from './config'
import deps from './deps'
import * as Errors from './errors'
import {IEventEmitter} from './events'
import * as Output from './output'

const timestamp = () => new Date().toISOString()
const wait = (ms: number) => new Promise(resolve => setTimeout(() => resolve(), ms))

function chomp(s: string): string {
  if (s.endsWith('\n')) return s.replace(/\n$/, '')
  return s
}

function canWrite(severity: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'): boolean {
  switch (config.logLevel) {
    case 'error': return ['fatal', 'error'].includes(severity)
    case 'warn': return ['fatal', 'error', 'warn'].includes(severity)
    case 'info': return ['fatal', 'error', 'warn', 'info'].includes(severity)
    case 'debug': return ['fatal', 'error', 'warn', 'info', 'debug'].includes(severity)
    case 'trace': return ['fatal', 'error', 'warn', 'info', 'debug', 'trace'].includes(severity)
    default: return false
  }
}

export default (e: IEventEmitter) => {
  let lines: string[] = []
  let cur: {close(): Promise<void>} | undefined

  function log(file: string) {
    let stream: Promise<fs.WriteStream> | undefined
    function getStream() {
      return stream = stream || (async () => {
        await fs.mkdirp(path.dirname(file))
        return fs.createWriteStream(file, {flags: 'a+', encoding: 'utf8'})
      })()
    }

    let flushing: Promise<void> = Promise.resolve()
    async function flush(waitForMs: number = 0) {
      if (lines.length === 0) return flushing
      const stream = await getStream()
      await wait(waitForMs)
      flushing = flushing.then(() => {
        if (lines.length === 0) return
        const mylines = lines
        lines = []
        return new Promise<any>((resolve, reject) => {
          stream.write(mylines.join('\n') + '\n', (err: any) => err ? reject(err) : resolve())
        })
      })
    }

    const handleOutput = (m: Output.Message | Errors.Message) => {
      if (!canWrite(m.severity)) return
      const msg = m.type === 'error' ? Errors.getErrorMessage(m.error) : Output.render(m)
      const output = chomp(_([timestamp(), m.severity.toUpperCase(), m.scope, msg]).compact().join(' '))
      lines.push(deps.stripAnsi(output))
      flush(50).catch(console.error)
    }
    e.on('output', handleOutput)

    async function close() {
      e.removeListener('output', handleOutput)
      if (!stream) return
      await flush()
      const s = await stream
      return new Promise<void>((resolve, reject) => {
        s.end()
        s.on('close', resolve)
        s.on('error', reject)
        stream = undefined
      })
    }

    return {close}
  }

  async function done() {
    if (cur) await cur.close()
  }

  async function startLogging() {
    await done()
    if (config.errlog) cur = log(config.errlog)
  }
  startLogging().catch(console.error)
  config.on('errlog', startLogging)

  return {
    done,
  }
}
