import { cli, CLI } from '.'

import * as stdMocks from 'std-mocks'

describe('with mocked stderr', () => {
  beforeEach(() => {
    stdMocks.use({ stderr: true })
  })

  afterEach(() => {
    stdMocks.restore()
  })

  test('outputs to stderr', () => {
    cli.warn('oh no!')
    const { stderr } = stdMocks.flush()
    expect(stderr[0]).toContain('oh no!')
  })
})

describe('with mocked stdout', () => {
  beforeEach(() => {
    stdMocks.use({ stdout: true })
  })

  afterEach(() => {
    stdMocks.restore()
  })

  test('outputs to stdout', () => {
    cli.log('yay!')
    const { stdout } = stdMocks.flush()
    expect(stdout[0]).toEqual('yay!\n')
  })
})

test('can be instantiated', () => {
  const newCLI = new CLI({ mock: true })
  newCLI.warn('foo')
  expect(newCLI.stderr).toContain('foo')
})
