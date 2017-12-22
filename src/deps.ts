import {Chalk} from 'chalk'
import stripAnsi = require('strip-ansi')
import moment = require('moment')
import ansiStyles = require('ansi-styles')

import Prompt from './prompt'
import {Errors} from './errors'
import ActionBase = require('./action/base')
import Base from './base'
import StreamOutput from './stream'
import Config from './config'
import screen = require('./screen')
import exitError = require('./exit_error')

export const deps = {
  get chalk(): Chalk { return fetch('chalk') },
  get moment(): typeof moment { return fetch('moment') },
  get stripAnsi(): typeof stripAnsi { return fetch('strip-ansi') },
  get ansiStyles(): typeof ansiStyles { return fetch('ansi-styles') },
  get ansiEscapes(): any { return fetch('ansi-escapes') },
  get passwordPrompt(): any { return fetch('password-prompt') },

  get Prompt(): typeof Prompt { return fetch('./prompt').default },
  get Errors(): typeof Errors { return fetch('./errors').Errors },
  get ActionBase(): typeof ActionBase { return fetch('./action/base') },
  get Base(): typeof Base { return fetch('./base').default },
  get StreamOutput(): typeof StreamOutput { return fetch('./stream').default },
  get Config(): typeof Config { return fetch('./config').default },
  get screen(): typeof screen.default { return fetch('./screen').default },
  get ExitError(): typeof exitError.ExitError { return fetch('./exit_error').ExitError },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}

export default deps
