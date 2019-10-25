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
  web_url: {extended: true},
  stack: {extended: true, get: (r: any) => r.stack && r.stack.name},
}

const ws = ' '

// ignore me
// stored up here for line wrapping reasons
const extendedHeader = `ID  Name${ws.padEnd(14)}Web url${ws.padEnd(34)}Stack${ws.padEnd(5)}`

// tests to-do:
// no-truncate
// truncation rules?

describe('styled/table', () => {
  fancy
    .end('export flags and display()', () => {
      expect(typeof (cli.table.flags())).to.eq('object')
      expect(typeof (cli.table)).to.eq('function')
    })

  fancy
    .end('has optional flags', _ => {
      const flags = cli.table.flags()
      expect(flags.columns).to.exist
      expect(flags.sort).to.exist
      expect(flags.filter).to.exist
      expect(flags.csv).to.exist
      expect(flags.extended).to.exist
      expect(flags['no-truncate']).to.exist
      expect(flags['no-header']).to.exist
    })

  fancy
    .stdout()
    .end('displays table', output => {
      cli.table(apps, columns)
      expect(output.stdout).to.equal(`ID  Name${ws.padEnd(14)}
123 supertable-test-1${ws}
321 supertable-test-2${ws}\n`)
    })

  describe('columns', () => {
    fancy
      .stdout()
      .end('use header value for id', output => {
        cli.table(apps, columns)
        expect(output.stdout.slice(0, 2)).to.equal('ID')
      })

    fancy
      .stdout()
      .end('shows extended columns/uses get() for value', output => {
        cli.table(apps, columns, {extended: true})
        expect(output.stdout).to.equal(`${extendedHeader}
123 supertable-test-1 https://supertable-test-1.herokuapp.com/ heroku-16${ws}
321 supertable-test-2 https://supertable-test-2.herokuapp.com/ heroku-16${ws}\n`)
      })
  })

  describe('options', () => {
    fancy
      .stdout()
      .end('shows extended columns', output => {
        cli.table(apps, columns, {extended: true})
        expect(output.stdout).to.contain(extendedHeader)
      })

    fancy
      .stdout()
      .end('skips header', output => {
        cli.table(apps, columns, {'no-header': true})
        expect(output.stdout).to.equal(`123 supertable-test-1${ws}
321 supertable-test-2${ws}\n`)
      })

    fancy
      .stdout()
      .end('only displays given columns', output => {
        cli.table(apps, columns, {columns: 'id'})
        expect(output.stdout).to.equal(`ID${ws}${ws}
123${ws}
321${ws}\n`)
      })

    fancy
      .stdout()
      .end('outputs in csv', output => {
        cli.table(apps, columns, {csv: true})
        expect(output.stdout).to.equal(`ID,Name
123,supertable-test-1
321,supertable-test-2\n`)
      })

    fancy
      .stdout()
      .end('outputs in csv with escaped values', output => {
        cli.table([
          {
            id: '123\n2',
            name: 'supertable-test-1',
          },
          {
            id: '12"3',
            name: 'supertable-test-2',
          },
          {
            id: '123',
            name: 'supertable-test-3,comma',
          },
          {
            id: '123',
            name: 'supertable-test-4',
          },
        ], columns, {csv: true})
        expect(output.stdout).to.equal(`ID,Name
"123\n2","supertable-test-1"
"12""3","supertable-test-2"
"123","supertable-test-3,comma"
123,supertable-test-4\n`)
      })

    fancy
      .stdout()
      .end('outputs in csv without headers', output => {
        cli.table(apps, columns, {csv: true, 'no-header': true})
        expect(output.stdout).to.equal(`123,supertable-test-1
321,supertable-test-2\n`)
      })

    fancy
      .stdout()
      .end('sorts by property', output => {
        cli.table(apps, columns, {sort: '-name'})
        expect(output.stdout).to.equal(`ID  Name${ws.padEnd(14)}
321 supertable-test-2${ws}
123 supertable-test-1${ws}\n`)
      })

    fancy
      .stdout()
      .end('filters by property & value (partial string match)', output => {
        cli.table(apps, columns, {filter: 'id=123'})
        expect(output.stdout).to.equal(`ID  Name${ws.padEnd(14)}
123 supertable-test-1${ws}\n`)
      })

    fancy
      .stdout()
      .end('does not truncate', output => {
        let three = {...apps[0], id: '0'.repeat(80), name: 'supertable-test-3'}
        cli.table(apps.concat(three), columns, {filter: 'id=0', 'no-truncate': true})
        expect(output.stdout).to.equal(`ID${ws.padEnd(78)} Name${ws.padEnd(14)}
${three.id} supertable-test-3${ws}\n`)
      })

  })

  describe('#flags', () => {
    fancy
      .end('includes only flags', _ => {
        let flags = cli.table.flags({only: 'columns'})
        expect(flags.columns).to.be.a('object')
        expect((flags as any).sort).to.be.undefined
      })

    fancy
      .end('excludes except flags', _ => {
        let flags = cli.table.flags({except: 'columns'})
        expect((flags as any).columns).to.be.undefined
        expect(flags.sort).to.be.a('object')
      })
  })

  describe('edge cases', () => {
    fancy
      .stdout()
      .end('ignores header case', output => {
        cli.table(apps, columns, {columns: 'iD,Name', filter: 'nAMe=supertable-test', sort: '-ID'})
        expect(output.stdout).to.equal(`ID  Name${ws.padEnd(14)}
321 supertable-test-2${ws}
123 supertable-test-1${ws}\n`)
      })

    fancy
      .stdout()
      .end('displays multiline cell', output => {
        const app3 = {
          build_stack: {
            name: 'heroku-16'
          },
          id: '456',
          name: 'supertable-test\n3',
          web_url: 'https://supertable-test-1.herokuapp.com/'
        }

        cli.table(apps.concat(app3 as any), columns, {sort: '-ID'})
        expect(output.stdout).to.equal(`ID  Name${ws.padEnd(14)}
456 supertable-test${ws.padEnd(3)}
    3${ws.padEnd(17)}
321 supertable-test-2${ws}
123 supertable-test-1${ws}\n`)
      })
  })
})
