import screen = require('@dxcli/screen')
import ansiStyles = require('ansi-styles')
import {Chalk} from 'chalk'
import stripAnsi = require('strip-ansi')

import Prompt = require('./prompt')

export const deps = {
  get chalk(): Chalk { return fetch('chalk') },
  get stripAnsi(): typeof stripAnsi { return fetch('strip-ansi') },
  get ansiStyles(): typeof ansiStyles { return fetch('ansi-styles') },
  get ansiEscapes(): any { return fetch('ansi-escapes') },
  get passwordPrompt(): any { return fetch('password-prompt') },
  get screen(): typeof screen { return fetch('@dxcli/screen') },
  get prompt(): typeof Prompt { return fetch('./prompt') },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}

export default deps
