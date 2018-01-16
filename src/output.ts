import Rx = require('rxjs/Rx')
import {inspect} from 'util'

import {CLI} from '.'
import {Message, OutputMessage} from './message'

export default function (cli: CLI): Rx.Observable<any> {
  function content(m: OutputMessage): string {
    const msg = m.input.map(a => typeof a === 'string' ? a : inspect(a)).join(' ')
    return (cli.scope ? `${cli.scope}: ${msg}` : msg) + '\n'
  }

  return cli
    .takeUntil(cli.filter(m => m.type === 'done'))
    .filter<Message, OutputMessage>((m): m is OutputMessage => m.type === 'output')
    .filter(m => {
      switch (cli.config.outputLevel) {
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
