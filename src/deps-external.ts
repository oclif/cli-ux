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
}
