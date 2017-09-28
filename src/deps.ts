import ansiStyles = require('ansi-styles')
import chalk = require('chalk')
import * as moment from 'moment'
import stripAnsi = require('strip-ansi')
import fs = require('fs-extra')

import { ActionBase, shouldDisplaySpinner } from './action/base'
import { SpinnerAction } from './action/spinner'
import { SimpleAction } from './action/simple'
import { Errors } from './errors'
import { Prompt } from './prompt'
import { StreamOutput } from './stream'
import { table, TableOptions } from './table'

export const deps = {
  // remote
  get ansiEscapes(): any { return fetch('ansi-escapes') },
  get ansiStyles(): typeof ansiStyles { return fetch('ansi-styles') },
  get chalk(): typeof chalk { return fetch('chalk') },
  get fs(): typeof fs { return fetch('fs-extra') },
  get linewrap(): any { return fetch('@heroku/linewrap') },
  get moment(): typeof moment { return fetch('moment') },
  get passwordPrompt() { return fetch('password-prompt') },
  get stripAnsi(): typeof stripAnsi { return fetch('strip-ansi') },
  get supportsColor() { return fetch('supports-color') },

  // local
  get shouldDisplaySpinner(): typeof shouldDisplaySpinner { return fetch('./action/base').shouldDisplaySpinner },
  get SpinnerAction(): typeof SpinnerAction { return fetch('./action/spinner').SpinnerAction },
  get SimpleAction(): typeof SimpleAction { return fetch('./action/simple').SimpleAction },
  get Errors(): typeof Errors { return fetch('./errors').Errors },
  get Prompt(): typeof Prompt { return fetch('./prompt').Prompt },
  get StreamOutput(): typeof StreamOutput { return fetch('./stream').StreamOutput },
  get table(): typeof table { return fetch('./table').table },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}
