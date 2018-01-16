import Rx = require('rxjs/Rx')
import {inspect} from 'util'

import {config} from './config'
import {Message, OutputMessage} from './message'

export default function (o: Rx.Observable<Message>): Rx.Observable<any> {
  function content(m: OutputMessage): string {
    const msg = m.input.map(a => typeof a === 'string' ? a : inspect(a)).join(' ')
    return (m.scope ? `${m.scope}: ${msg}` : msg) + '\n'
  }

  return o
    .takeUntil(o.filter(m => m.type === 'done'))
    .filter<Message, OutputMessage>((m): m is OutputMessage => m.type === 'output')
    .filter(m => {
      switch (config.outputLevel) {
        case 'info': return m.severity === 'info'
        case 'debug': return ['info', 'debug'].includes(m.severity)
        case 'trace': return ['info', 'debug', 'trace'].includes(m.severity)
        default: return false
      }
    })
    .do(m => process.stdout.write(content(m)))
    .catch((err, caught) => {
      // tslint:disable no-console
      console.error(err)
      return caught
    })
}
