import Error from './errors'
import StreamOutput from './stream'

let errors: Error

beforeEach(() => {
  errors = new Error()
})

test('shows a warning', () => {
  errors.warn('uh oh')
  expect(errors.stderr.output).toEqual(' ▸    uh oh\n')
})
