import * as fs from 'fs-extra'
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
  let flushing: Promise<void> = Promise.resolve()
  let buffer: string[] = []
  // it would be preferable to use createWriteStream
  // but it gives out EPERM issues on windows for some reason
  //
  // let stream: Promise<fs.WriteStream> | undefined
  // function getStream() {
  //   return stream = stream || (async () => {
  //     await fs.mkdirp(path.dirname(file))
  //     return fs.createWriteStream(file, {flags: 'a+', encoding: 'utf8'})
  //   })()
  // }

  const handleOutput = (m: Output.Message | Errors.Message) => {
    if (!canWrite(m.severity)) return
    let msg = m.type === 'error' ? Errors.getErrorMessage(m.error, {stack: true}) : Output.render(m)
    msg = deps.stripAnsi(chomp(msg))
    let lines = msg.split('\n').map(l => `${timestamp()} ${l}`)
    buffer.push(...lines)
    flush(50).catch(console.error)
  }
  e.on('output', handleOutput)

  async function flush(waitForMs: number = 0) {
    await wait(waitForMs)
    flushing = flushing.then(async () => {
      if (!config.errlog || buffer.length === 0) return
      const file = config.errlog
      const mylines = buffer
      buffer = []
      await fs.mkdirp(path.dirname(file))
      await fs.appendFile(file, mylines.join('\n') + '\n')
    })
    await flushing
  }

  return {flush}
}
