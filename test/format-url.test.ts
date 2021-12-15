import ux from '../src'

import {expect, fancy} from './fancy'

process.env.FORCE_HYPERLINK = '1'

describe('prompt', () => {
  fancy
  .it('formats hyperlinks for rendering', async () => {
    expect(ux.formatUrl('sometext', 'https://google.com')).to.contain('ttps://google.com\u0007sometext')
  })
})
