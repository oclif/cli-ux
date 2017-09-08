import * as moment from 'moment'
import stripAnsi = require('strip-ansi')

export const deps = {
  get moment(): typeof moment {
    return fetch('moment')
  },
  get stripAnsi(): typeof stripAnsi {
    return fetch('strip-ansi')
  },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}
