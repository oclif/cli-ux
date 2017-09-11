import maxBy = require('lodash.maxby')
import padEnd = require('lodash.padend')
import ansiStyles = require('ansi-styles')
import chalk = require('chalk')
import * as moment from 'moment'
import stripAnsi = require('strip-ansi')

export const deps = {
  get ansiStyles(): typeof ansiStyles {
    return fetch('ansi-styles')
  },
  get ansiEscapes(): any {
    return fetch('ansi-escapes')
  },
  get chalk(): typeof chalk {
    return fetch('chalk')
  },
  get maxBy(): typeof maxBy {
    return fetch('lodash.maxby')
  },
  get padEnd(): typeof padEnd {
    return fetch('lodash.padend')
  },
  get linewrap(): any {
    return fetch('@heroku/linewrap')
  },
  get moment(): typeof moment {
    return fetch('moment')
  },
  get stripAnsi(): typeof stripAnsi {
    return fetch('strip-ansi')
  },
  get supportsColor() {
    return fetch('supports-color')
  },
  get passwordPrompt() {
    return fetch('password-prompt')
  },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}
