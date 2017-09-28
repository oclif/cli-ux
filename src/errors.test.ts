import cli from '.'

beforeEach(() => {
  cli.config.mock = true
})

test('shows a warning', () => {
  cli.warn('uh oh')
  expect(cli.stderr.output).toEqual(' ▸    uh oh\n')
})

test('shows a warning with context', () => {
  cli.warn('uh oh', { context: 'foo' })
  expect(cli.stderr.output).toEqual(' ▸    foo: uh oh\n')
})
