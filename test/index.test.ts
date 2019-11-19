import ux from '../src'

import {expect, fancy} from './fancy'

process.env.FORCE_HYPERLINK = '1'

describe('prompt', () => {
  fancy
  .stdout()
  .do(() => ux.url('sometext', 'https://google.com'))
  .it('renders hyperlink', async ({stdout}) => {
    expect(stdout).to.equal('ttps://google.com\u0007sometext\n')
  })
})
