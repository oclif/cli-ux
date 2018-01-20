// tslint:disable

import * as util from 'util'

import deps from '../deps'

export default function styledObject(obj: any, keys?: string[]) {
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
  let logKeyValue = (key: string, value: any) => {
    console.log(`${deps.chalk.blue(key)}:` + ' '.repeat(maxKeyLength - key.length - 1) + pp(value))
  }
  for (let key of keys || Object.keys(obj).sort()) {
    let value = obj[key]
    if (Array.isArray(value)) {
      if (value.length > 0) {
        logKeyValue(key, value[0])
        for (let e of value.slice(1)) {
          console.log(' '.repeat(maxKeyLength) + pp(e))
        }
      }
    } else if (value !== null && value !== undefined) {
      logKeyValue(key, value)
    }
  }
}
