// @flow

const {CLIUX} = require('.')

let cli
beforeEach(() => {
  cli = new CLIUX({mock: true})
})

test('it warns', () => {
  cli.warn(new Error('uh oh'))
  expect(cli.stderr).toEqual(' ▸    uh oh\n')
})
