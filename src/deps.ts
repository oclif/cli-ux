import * as moment from 'moment'

export const deps = {
  get moment(): typeof moment {
    return fetch('moment')
  },
  get stripAnsi(): any {
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
