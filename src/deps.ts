import screen = require('@oclif/screen')
import ansiStyles = require('ansi-styles')
import stripAnsi = require('strip-ansi')

import open = require('./open')
import prompt = require('./prompt')
import styledHeader = require('./styled/header')
import styledJSON = require('./styled/json')
import styledObject = require('./styled/object')
import table = require('./styled/table')

export const deps = {
  get stripAnsi(): typeof stripAnsi { return fetch('strip-ansi') },
  get ansiStyles(): typeof ansiStyles { return fetch('ansi-styles') },
  get ansiEscapes(): any { return fetch('ansi-escapes') },
  get passwordPrompt(): any { return fetch('password-prompt') },
  get screen(): typeof screen { return fetch('@oclif/screen') },

  get open(): typeof open.default { return fetch('./open').default },
  get prompt(): typeof prompt.default { return fetch('./prompt').default },
  get styledObject(): typeof styledObject.default { return fetch('./styled/object').default },
  get styledHeader(): typeof styledHeader.default { return fetch('./styled/header').default },
  get styledJSON(): typeof styledJSON.default { return fetch('./styled/json').default },
  get table(): typeof table.default { return fetch('./styled/table').default },
}

const cache: any = {}

function fetch(s: string) {
  if (!cache[s]) {
    cache[s] = require(s)
  }
  return cache[s]
}

export default deps
