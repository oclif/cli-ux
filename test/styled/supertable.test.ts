import {expect, fancy} from 'fancy-test'

import cli from '../../src'

const apps = [
  {
    build_stack: {
      id: '123',
      name: 'heroku-16'
    },
    created_at: '2000-01-01T22:34:46Z',
    id: '123',
    git_url: 'https://git.heroku.com/supertable-test-1.git',
    name: 'supertable-test-1',
    owner: {
      email: 'example@heroku.com',
      id: '1'
    },
    region: {id: '123', name: 'us'},
    released_at: '2000-01-01T22:34:46Z',
    stack: {
      id: '123',
      name: 'heroku-16'
    },
    updated_at: '2000-01-01T22:34:46Z',
    web_url: 'https://supertable-test-1.herokuapp.com/'
  },
  {
    build_stack: {
      id: '321',
      name: 'heroku-16'
    },
    created_at: '2000-01-01T22:34:46Z',
    id: '321',
    git_url: 'https://git.heroku.com/phishing-demo.git',
    name: 'supertable-test-2',
    owner: {
      email: 'example@heroku.com',
      id: '1'
    },
    region: {id: '321', name: 'us'},
    released_at: '2000-01-01T22:34:46Z',
    stack: {
      id: '321',
      name: 'heroku-16'
    },
    updated_at: '2000-01-01T22:34:46Z',
    web_url: 'https://supertable-test-2.herokuapp.com/'
  },
]

let columns = {
  id: {header: 'ID'},
  name: {},
  web_url: {additional: true},
  stack: {additional: true, get: (r: any) => r.stack && r.stack.name},
}

const ws = ' '

// ignore me
// stored up here for line wrapping reasons
const additionalHeader = `ID  Name${ws.padEnd(14)
  }Web url${ws.padEnd(34)}Stack${ws.padEnd(5)}`

// tests to-do:
// no-truncate
// truncation rules?

describe('styled/supertable', () => {
  fancy
    .end('export flags and display()', _ => {
      expect(typeof (cli.supertable.flags)).to.eq('object')
      expect(typeof (cli.supertable.display)).to.eq('function')
    })

  fancy
    .end('has optional flags', _ => {
      const flags = cli.supertable.flags
      expect(flags.columns).to.exist
      expect(flags.sort).to.exist
      expect(flags.filter).to.exist
      expect(flags.csv).to.exist
      expect(flags.additional).to.exist
      expect(flags['no-truncate']).to.exist
      expect(flags['no-header']).to.exist
    })
  fancy
    .stdout()
    .end('displays supertable', output => {
      cli.supertable.display(apps, columns)
      expect(output.stdout).to.equal(`ID  Name${ws.padEnd(14)}
123 supertable-test-1${ws}
321 supertable-test-2${ws}\n`)
    })

  describe('columns', () => {
    fancy
      .stdout()
      .end('use header value for id', output => {
        cli.supertable.display(apps, columns)
        expect(output.stdout.slice(0, 2)).to.equal('ID')
    })

    fancy
      .stdout()
      .end('shows additional columns/uses get() for value', output => {
        cli.supertable.display(apps, columns, {additional: true})
        expect(output.stdout).to.equal(`${additionalHeader}
123 supertable-test-1 https://supertable-test-1.herokuapp.com/ heroku-16${ws}
321 supertable-test-2 https://supertable-test-2.herokuapp.com/ heroku-16${ws}\n`)
      })
  })

  describe('options', () => {
    fancy
      .stdout()
      .end('shows additional columns', output => {
        cli.supertable.display(apps, columns, {additional: true})
        expect(output.stdout).to.contain(additionalHeader)
      })

    fancy
      .stdout()
      .end('skips header', output => {
        cli.supertable.display(apps, columns, {'no-header': true})
        expect(output.stdout).to.equal(`123 supertable-test-1${ws}
321 supertable-test-2${ws}\n`)
      })

    fancy
      .stdout()
      .end('only displays given columns', output => {
        cli.supertable.display(apps, columns, {columns: 'id'})
        expect(output.stdout).to.equal(`ID${ws}${ws}
123${ws}
321${ws}\n`)
      })

    fancy
      .stdout()
      .end('outputs in csv', output => {
        cli.supertable.display(apps, columns, {csv: true})
        expect(output.stdout).to.equal(`ID,Name
123,supertable-test-1
321,supertable-test-2\n`)
      })

    fancy
      .stdout()
      .end('sorts by property', output => {
        cli.supertable.display(apps, columns, {sort: '-name'})
        expect(output.stdout).to.equal(`ID  Name${ws.padEnd(14)}
321 supertable-test-2${ws}
123 supertable-test-1${ws}\n`)
      })

    fancy
      .stdout()
      .end('filters by property & value (partial string match)', output => {
        cli.supertable.display(apps, columns, {filter: 'id=123'})
        expect(output.stdout).to.equal(`ID  Name${ws.padEnd(14)}
123 supertable-test-1${ws}\n`)
      })

  })
})
