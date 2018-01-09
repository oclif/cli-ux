import screen = require('@cli-engine/screen')
import ansiStyles = require('ansi-styles')
import {Chalk} from 'chalk'
import stripAnsi = require('strip-ansi')

import ActionBase = require('./action/base')
import Base from './base'
import {Config} from './config'
import exitError = require('./exit_error')
import Prompt from './prompt'
import StreamOutput from './stream'

export const deps = {
  get chalk(): Chalk { return fetch('chalk') },
  get stripAnsi(): typeof stripAnsi { return fetch('strip-ansi') },
  get ansiStyles(): typeof ansiStyles { return fetch('ansi-styles') },
  get ansiEscapes(): any { return fetch('ansi-escapes') },
  get passwordPrompt(): any { return fetch('password-prompt') },
  get screen(): typeof screen { return fetch('@cli-engine/screen') },

  get Prompt(): typeof Prompt { return fetch('./prompt').default },
  get ActionBase(): typeof ActionBase { return fetch('./action/base') },
  get Base(): typeof Base { return fetch('./base').default },
  get StreamOutput(): typeof StreamOutput { return fetch('./stream').default },
  get config(): Config { return fetch('./config').default },
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
