import {flags as Flags} from '@oclif/command'
import {stdtermwidth} from '@oclif/screen'
import chalk from 'chalk'
import * as _ from 'lodash'
import {inspect} from 'util'

const sw = require('string-width')

function outputCSV(data: any[], columns: SuperTable.Column[], options: SuperTable.Options) {
  options.printLine(columns.map(c => c.header).join(','))
  data.forEach((d: any) => {
    let row: string[] = []
    columns.forEach(col => row.push(d[col.key] || ''))
    options.printLine(row.join(','))
  })
}

function outputTable(data: any[], columns: SuperTable.Column[], options: SuperTable.Options) {
  // find min/max column width
  for (let col of columns) {
    if (col.staticWidth) continue
    const widths = [col.header, ...data.map(row => row[col.key])].map(r => sw(r))
    col.width = Math.max(...widths) + 1
  }

  const maxWidth = stdtermwidth
  const shouldShorten = () => {
    // don't shorten if full mode
    if (options.full || !process.stdout.isTTY) return
    // don't shorten if there is enough screen width
    if (_.sumBy(columns, c => c.width!) <= maxWidth) return
    for (let col of columns) {
      if (col.staticWidth || col.width === col.minWidth) continue
      col.width = col.minWidth || sw(col.header)
    }
  }
  shouldShorten()

  // print headers
  if (!options['no-header']) {
    let headers = ''
    for (let col of columns) {
      let header = col.header!
      headers += header.padEnd(col.width! + 1)
    }
    options.printLine(chalk.bold(headers))
  }

  // print rows
  for (let row of data) {
    for (let col of columns) {
      const width = col.width!
      let o = row[col.key].padEnd(width)
      if (o.length > width) {
        o = o.slice(0, width - 1) + '…'
      }
      process.stdout.write(o + ' ')
    }
    process.stdout.write('\n')
  }
}

function outputArray(data: any[], columns: SuperTable.Column[], options: SuperTable.Options) {
  // build table rows from input array data
  let rows = data.map(d => {
    let row = {}
    for (let col of columns) {
      let val = _.get(d, col.key)
      val = col.get && col.get(val, d)
      if (typeof (val) === 'boolean' || !val) val = inspect(val, {breakLength: Infinity})
      _.set(row, col.key, val)
    }
    return row
  })

  // filter rows
  if (options.filter) {
    let [key, regex] = options.filter!.split('=')
    let col = columns.find(c => c.header.toLowerCase() === key)
    if (!col || !regex) throw new Error('Filter flag error')
    rows = rows.filter((d: any) => {
      let re = new RegExp(regex)
      let val = d[col!.key]
      return val.match(re)
    })
  }

  // sort rows
  if (options.sort) {
    let [sort1, sort2] = options.sort!.split(',')
    if (!sort1) throw new Error('Sort flag error')
    let sort1Order = 'asc'
    let sort2Order = 'asc'
    let sortKeys = []
    let sortKeysOrder = []

    if (sort1[0] === '-') {
      sort1Order = 'desc'
      sort1 = sort1.slice(1, sort1.length)
    }
    sortKeys.push(sort1)
    sortKeysOrder.push(sort1Order)

    if (sort2) {
      if (sort2[0] === '-') {
        sort2Order = 'desc'
        sort2 = sort2.slice(1, sort2.length)
      }
      sortKeys.push(sort2)
      sortKeysOrder.push(sort2Order)
    }

    rows = _.orderBy(rows, sortKeys, sortKeysOrder)
  }

  // display
  const output = options.csv ? outputCSV : outputTable
  output(rows, columns, options)
}

const flags = {
  columns: Flags.string({exclusive: ['all'], description: 'only show provided columns'}),
  sort: Flags.string({description: 'property to sort by'}),
  filter: Flags.string({description: 'filter property by regex'}),
  csv: Flags.boolean({exclusive: ['json'], description: 'output is csv format'}),
  extended: Flags.boolean({description: 'show more/extended properties'}),
  full: Flags.boolean({description: 'do not truncate output to fit screen'}),
  'no-header': Flags.boolean({exclusive: ['csv'], description: 'hide header from output'}),
}

function build(data: any, cols: SuperTable.ColumnOptions[], options: SuperTable.Options) {
  // tslint:disable-next-line:no-console
  if (!options.printLine) options.printLine = (s: any) => console.log(s)
  if (!options.sort) options.sort = 'name'

  // clean up columns array
  let columns: SuperTable.Column[] = cols.map(col => {
    let header = col.header || _.capitalize(col.key.replace(/\_/g, ' '))
    if (!col.width) col.width = 0
    if (col.width) col.staticWidth = true
    if (col.minWidth) col.minWidth = Math.max(col.minWidth, sw(header))
    return {
      extended: false,
      get: (cell: any) => cell,
      ...col,
      header,
    }
  })

  // filter columns
  if (options.columns) {
    let keys = options.columns!.split(',').map(k => k.replace(/\s/g, '_'))
    columns = columns.filter(c => keys.includes(c.key))
  } else if (!options.extended) {
    // show extented columns/properties
    columns = columns.filter(c => !c.extended)
  }

  // display
  if (!Array.isArray(data)) data = [data]
  return outputArray(data, columns, options)
}

export namespace SuperTable {
  export type ColumnOptions = Partial<Column> & { key: string }

  export interface Column {
    key: string
    header: string
    extended?: boolean
    minWidth?: number
    width?: number
    staticWidth?: boolean
    get(cell: any, row: any): string
  }

  export interface Options {
    printLine?: any,
    sort?: string,
    filter?: string,
    columns?: string,
    extended?: boolean,
    full?: boolean,
    csv?: boolean,
    'no-header'?: boolean,
  }
}

export default {
  flags,
  build,
}
