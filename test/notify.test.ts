import cli from '../src'

import {fancy} from './fancy'

describe('notify', () => {
  fancy
  .stderr()
  .it('shows notification', (_, done) => {
    cli.notify({message: 'example notification'}, done)
  })
})
