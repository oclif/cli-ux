import {inspect} from 'util'

import {config} from './config'
import {IEventEmitter} from './events'

export interface Message {
  type: 'output'
  scope: string | undefined
  severity: 'trace' | 'debug' | 'info'
  data: any[]
}

export function render(m: Message): string {
  const msg = m.data.map(a => typeof a === 'string' ? a : inspect(a)).join(' ')
  return (m.scope ? `${m.scope}: ${msg}` : msg) + '\n'
}

function shouldLog(m: Message) {
  switch (config.outputLevel) {
    case 'info': return m.severity === 'info'
    case 'debug': return ['info', 'debug'].includes(m.severity)
    case 'trace': return ['info', 'debug', 'trace'].includes(m.severity)
    default: return false
  }
}

export default (e: IEventEmitter) => {
  e.on('output', m => {
    if (m.type !== 'output') return
    if (!shouldLog(m)) return
    process.stdout.write(render(m))
  })

  return (severity: 'trace' | 'debug' | 'info', scope?: string) => (...data: any[]) => {
    const msg: Message = {type: 'output', scope, severity, data}
    e.emit('output', msg)
  }
}
