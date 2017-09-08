import { cli } from '.'

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
