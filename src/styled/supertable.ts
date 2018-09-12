import {flags as Flags} from '@oclif/command'
import {stdtermwidth} from '@oclif/screen'
import chalk from 'chalk'
import * as _ from 'lodash'

const sw = require('string-width')

function outputCSV(data: any[], columns: Column[], options: Options) {
  options.printLine(columns.map(c => c.header).join(','))
  data.forEach((d: any) => {
    let row: string[] = []
    columns.forEach(col => row.push(d[col.key] || ''))
    options.printLine(row.join(','))
  })
}

function outputTable(data: any[], columns: Column[], options: Options) {
  // find max column width
  for (let col of columns) {
    const widths = ['.'.padEnd(col.minWidth!), col.header, ...data.map(row => row[col.key])].map(r => sw(r))
    col.maxWidth = Math.max(...widths) + 1
    col.width = col.maxWidth!
  }

  const maxWidth = stdtermwidth
  const shouldShorten = () => {
    // don't shorten if full mode
    if (options['no-header'] || !process.stdout.isTTY) return

    // don't shorten if there is enough screen width
    let dataMaxWidth = _.sumBy(columns, c => c.width!)
    let dataMinWidth = _.sumBy(columns, c => c.minWidth!)
    let overWidth = dataMaxWidth - maxWidth
    if (overWidth <= 0) return

    // not enough room, short all cols to minWidth
    for (let col of columns) {
      col.width = col.minWidth //|| sw(col.header)
    }

    // if sum(minWidth's) is greater, return
    if (dataMinWidth >= maxWidth) return

    // some wiggle room left, add it back
    let wiggleRoom = maxWidth - dataMinWidth
    let needyCols = _.sortBy(columns.map(c => ({key: c.key, needs: c.maxWidth! - c.width!})), c => c.needs)
    for (let {key, needs} of needyCols) {
      if (!needs) continue
      let col = _.find(columns, c => (key === c.key))
      if (!col) continue
      if (wiggleRoom > needs) {
        col.width = col.width! + needs
        wiggleRoom = wiggleRoom - needs
      } else if (wiggleRoom) {
        col.width = col.width! + wiggleRoom
        wiggleRoom = 0
      }
    }
  }
  shouldShorten()

  // print headers
  if (!options['no-header']) {
    let headers = ''
    for (let col of columns) {
      let header = col.header!
      headers += header.padEnd(col.width!)
    }
    options.printLine(chalk.bold(headers))
  }

  // print rows
  for (let row of data) {
    for (let col of columns) {
      const width = col.width!
      let o = row[col.key].padEnd(width)
      if (o.length > width) {
        o = o.slice(0, width - 2) + '… '
      }
      process.stdout.write(o)
    }
    process.stdout.write('\n')
  }
}

function output(data: any[], columns: Column[], options: Options) {
  // build table rows from input array data
  let rows = data.map(d => {
    let row: {[key: string]: string | number | boolean} = {}
    for (let col of columns) {
      row[col.key] = col.get(d)
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
  (options.csv ? outputCSV : outputTable)(rows, columns, options)
}

const flags = {
  columns: Flags.string({exclusive: ['additional'], description: 'only show provided columns (comma-seperated)'}),
  sort: Flags.string({description: 'property to sort by (prepend \'-\' for descending)'}),
  filter: Flags.string({description: 'filter property by partial string matching, ex: name=foo'}),
  csv: Flags.boolean({exclusive: ['no-truncate'], description: 'output is csv format'}),
  additional: Flags.boolean({description: 'show additional properties'}),
  'no-truncate': Flags.boolean({exclusive: ['csv'], description: 'do not truncate output to fit screen'}),
  'no-header': Flags.boolean({exclusive: ['csv'], description: 'hide table header from output'}),
}

function display(data: any, cols: SuperTable.Columns, options: SuperTable.Options = {}) {
  // tslint:disable-next-line:no-console
  if (!options.printLine) options.printLine = (s: any) => console.log(s)
  if (!options.sort) options.sort = 'name'

  // clean up columns array
  let columns: Column[] = Object.keys(cols).map((key: string) => {
    const col = cols[key]
    const header = col.header || _.capitalize(key.replace(/\_/g, ' '))
    const minWidth = Math.max(col.minWidth || 0, sw(header) + 1)
    return {
      key,
      additional: false,
      get: (row: any) => row[key],
      ...col,
      header,
      minWidth,
    }
  })

  // filter columns
  if (options.columns) {
    let keys = options.columns!.split(',').map(k => k.replace(/\s/g, '_'))
    columns = columns.filter(c => keys.includes(c.key))
  } else if (!options.additional) {
    // show extented columns/properties
    columns = columns.filter(c => !c.additional)
  }

  // display
  if (!Array.isArray(data)) data = [data]
  return output(data, columns, options)
}

export namespace SuperTable {
  export type Columns = {[key: string]: Partial<Column>}

  export interface Column {
    key: string
    header: string
    additional: boolean
    minWidth: number
    get(row: any): string
  }

  export interface Options {
    printLine?: any,
    sort?: string,
    filter?: string,
    columns?: string,
    additional?: boolean,
    'no-truncate'?: boolean,
    csv?: boolean,
    'no-header'?: boolean,
  }
}

type Column = SuperTable.Column & {width?: number, maxWidth?: number}
type Options = SuperTable.Options

export default {
  flags,
  display,
}
