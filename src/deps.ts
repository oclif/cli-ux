/* eslint-disable node/no-missing-require */
export default {
  get stripAnsi(): (string: string) => string {
    return require('strip-ansi')
  },
  get ansiStyles(): typeof import('ansi-styles') {
    return require('ansi-styles')
  },
  get ansiEscapes(): any {
    return require('ansi-escapes')
  },
  get passwordPrompt(): any {
    return require('password-prompt')
  },
  get screen(): typeof import('@oclif/screen') {
    return require('@oclif/screen')
  },
  get open(): typeof import('./open').default {
    return require('./open').default
  },
  get prompt(): typeof import('./prompt') {
    return require('./prompt')
  },
  get styledObject(): typeof import('./styled/object').default {
    return require('./styled/object').default
  },
  get styledHeader(): typeof import('./styled/header').default {
    return require('./styled/header').default
  },
  get styledJSON(): typeof import('./styled/json').default {
    return require('./styled/json').default
  },
  get table(): typeof import('./styled/table').table {
    return require('./styled/table').table
  },
  get tree(): typeof import('./styled/tree').default {
    return require('./styled/tree').default
  },
  get wait(): typeof import('./wait').default {
    return require('./wait').default
  },
  get progress(): typeof import ('./styled/progress').default {
    return require('./styled/progress').default
  },
}
