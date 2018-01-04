const stdmock = require('std-mocks')

import { cli } from '.'

describe('with mocked stderr', () => {
  beforeEach(() => {
    cli.config.mock = false
    stdmock.use({ stderr: true })
  })

  afterEach(() => {
    stdmock.restore()
  })

  test('outputs to stderr', () => {
    cli.warn('oh no!')
    const { stderr } = stdmock.flush()
    expect(stderr[0]).toContain('oh no!')
  })

  test('outputs more to stderr', () => {
    stdmock.use()
    cli.stderr.write('it works')
    stdmock.restore()
    expect(stdmock.flush().stderr).toEqual(['it works'])
  })
})

describe('with mocked stdout', () => {
  beforeEach(() => {
    stdmock.use({ stdout: true })
  })

  afterEach(() => {
    stdmock.restore()
  })

  test('outputs to stdout', () => {
    cli.log('yay!')
    const { stdout } = stdmock.flush()
    expect(stdout[0]).toEqual('yay!\n')
  })

  test('outputs more to stdout', () => {
    stdmock.use()
    cli.stdout.write('it works')
    cli.stdout.write('it works\n')
    stdmock.restore()
    expect(stdmock.flush().stdout).toEqual(['it works', 'it works\n'])
  })
})

describe('with mocked cli', () => {
  beforeEach(() => {
    cli.config.mock = true
  })

  test('exit', () => {
    expect.assertions(1)
    try {
      cli.exit(1)
    } catch (err) {
      if (!err.code) throw err
      expect(err.code).toBe(1)
    }
  })

  test('warn', () => {
    cli.warn('foo')
    expect(cli.stderr.output).toContain('foo')
  })

  describe('error', () => {
    test('error', () => {
      expect.assertions(2)
      try {
        cli.error('foo\nbar')
      } catch (err) {
        expect(err.code).toBe(1)
        expect(cli.stderr.output).toContain('foo')
      }
    })
  })

  test('styledHeader', () => {
    cli.styledHeader('foobar')
    expect(cli.stdout.output).toBe('=== foobar\n')
  })

  test('styledJSON', () => {
    cli.styledJSON({ foo: 'bar' })
    expect(cli.stdout.output).toBe(`{
  "foo": "bar"
}
`)
  })

  test('styledObject', () => {
    cli.styledObject({ foo: 'bar', info: { arr: ['a', 'b', 'c'] } }, ['foo', 'info'])
    expect(cli.stdout.output).toBe(`foo:  bar
info: arr: [ 'a', 'b', 'c' ]
`)
  })

  test('table', () => {
    cli.table([{ name: 'a' }, { name: 'b' }], {
      columns: [{ key: 'name' }] as any,
    })
    expect(cli.stdout.output).toBe(`name
────
a
b
`)
  })
})
