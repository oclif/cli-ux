import { Errors } from './errors'

let errors: Errors

beforeEach(() => {
  errors = new Errors()
})

test('shows a warning', () => {
  errors.warn('uh oh')
  expect(errors.stderr.output).toEqual(' ▸    uh oh\n')
})

test('shows a warning with context', () => {
  errors.warn('uh oh', 'foo')
  expect(errors.stderr.output).toEqual(' ▸    foo: uh oh\n')
})
