// tslint:disable

import chalk from 'chalk'
import * as util from 'util'

export default function styledObject(obj: any, keys?: string[]): string {
  let output: string[] = []
  let keyLengths = Object.keys(obj).map(key => key.toString().length)
  let maxKeyLength = Math.max.apply(Math, keyLengths) + 2
  function pp(obj: any) {
    if (typeof obj === 'string' || typeof obj === 'number') return obj
    if (typeof obj === 'object') {
      return Object.keys(obj)
        .map(k => k + ': ' + util.inspect(obj[k]))
        .join(', ')
    } else {
      return util.inspect(obj)
    }
  }
  let logKeyValue = (key: string, value: any): string => {
    return `${chalk.blue(key)}:` + ' '.repeat(maxKeyLength - key.length - 1) + pp(value)
  }
  for (let key of keys || Object.keys(obj).sort()) {
    let value = obj[key]
    if (Array.isArray(value)) {
      if (value.length > 0) {
        output.push(logKeyValue(key, value[0]))
        for (let e of value.slice(1)) {
          output.push(' '.repeat(maxKeyLength) + pp(e))
        }
      }
    } else if (value !== null && value !== undefined) {
      output.push(logKeyValue(key, value))
    }
  }
  return output.join('\n')
}
