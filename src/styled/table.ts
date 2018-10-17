import {flags as Flags} from '@oclif/command'
import {stdtermwidth} from '@oclif/screen'
import chalk from 'chalk'
import * as _ from 'lodash'
import {inspect} from 'util'

const sw = require('string-width')

class Table<T extends object> {
  options: table.Options & { printLine(s: any): any }
  columns: (table.Column<T> & { key: string, width?: number, maxWidth?: number })[]

  constructor(private data: T[], columns: table.Columns<T>, options: table.Options = {}) {
    // assign columns
    this.columns = Object.keys(columns).map((key: string) => {
      const col = columns[key]
      const extra = col.extra || false
      const get = col.get || ((row: any) => row[key])
      const header = col.header || _.capitalize(key.replace(/\_/g, ' '))
      const minWidth = Math.max(col.minWidth || 0, sw(header) + 1)

      return {
        extra,
        get,
        header,
        key,
        minWidth,
      }
    })

    // and filter columns
    if (options.columns) {
      let headers = options.columns!.split(',').map(k => k.replace(/\s/g, '_'))
      this.columns = this.filterColumnsFromHeaders(headers)
    } else if (!options.extra) {
      // show extented columns/properties
      this.columns = this.columns.filter(c => !c.extra)
    }

    // assign options
    const {columns: cols, filter, csv, extra, sort, printLine} = options
    this.options = {
      columns: cols,
      csv,
      extra,
      filter,
      'no-header': options['no-header'],
      'no-truncate': options['no-truncate'],
      printLine: printLine || ((s: any) => process.stdout.write(s + '\n')),
      sort,
    }
  }

  display() {
    // tslint:disable-next-line:no-this-assignment
    const {data, columns, options} = this

    // build table rows from input array data
    let rows = data.map(d => {
      let row: any = {}
      for (let col of columns) {
        let val = col.get(d)
        if (typeof val !== 'string') val = inspect(val, {breakLength: Infinity})
        row[col.key] = val
      }
      return row
    })

    // filter rows
    if (options.filter) {
      let [header, regex] = options.filter!.split('=')
      // to-do: add inverse filter
      // const isInverse = header[header.length - 1] === '!'
      // if (isInverse) header = header.slice(0, header.length - 1)
      let col = this.findColumnFromHeader(header)
      if (!col || !regex) throw new Error('Filter flag has an invalid value')
      rows = rows.filter((d: any) => {
        let re = new RegExp(regex)
        let val = d[col!.key]
        // return isInverse ? !val.match(re) : val.match(re)
        return val.match(re)
      })
    }

    // sort rows
    if (options.sort) {
      let sorters = options.sort!.split(',')
      let sortKeys = sorters.map(k => k[0] === '-' ? k.substr(1) : k)
      let sortKeysOrder = sorters.map(k => k[0] === '-' ? 'desc' : 'asc')
      rows = _.orderBy(rows, sortKeys, sortKeysOrder)
    }

    this.data = rows

    if (options.csv) this.outputCSV()
    else this.outputTable()
  }

  private findColumnFromHeader(header: string): (table.Column<T> & { key: string, width?: number, maxWidth?: number }) | undefined {
    return this.columns.find(c => c.header.toLowerCase() === header)
  }

  private filterColumnsFromHeaders(headers: string[]): (table.Column<T> & { key: string, width?: number, maxWidth?: number })[] {
    return this.columns.filter(c => headers.includes(c.header.toLowerCase()))
  }

  private outputCSV() {
    // tslint:disable-next-line:no-this-assignment
    const {data, columns, options} = this

    options.printLine(columns.map(c => c.header).join(','))
    data.forEach((d: any) => {
      let row: string[] = []
      columns.forEach(col => row.push(d[col.key] || ''))
      options.printLine(row.join(','))
    })
  }

  private outputTable() {
    // tslint:disable-next-line:no-this-assignment
    const {data, columns, options} = this

    // column truncation
    //
    // find max width for each column
    for (let col of columns) {
      const widths = ['.'.padEnd(col.minWidth!), col.header, ...data.map((row: any) => row[col.key])].map(r => sw(r))
      col.maxWidth = Math.max(...widths) + 1
      col.width = col.maxWidth!
    }
    // terminal width
    const maxWidth = stdtermwidth
    // truncation logic
    const shouldShorten = () => {
      // don't shorten if full mode
      if (options['no-header'] || !process.stdout.isTTY) return

      // don't shorten if there is enough screen width
      let dataMaxWidth = _.sumBy(columns, c => c.width!)
      let overWidth = dataMaxWidth - maxWidth
      if (overWidth <= 0) return

      // not enough room, short all columns to minWidth
      for (let col of columns) {
        col.width = col.minWidth
      }

      // if sum(minWidth's) is greater than term width
      // nothing can be done so
      // display all as minWidth
      let dataMinWidth = _.sumBy(columns, c => c.minWidth!)
      if (dataMinWidth >= maxWidth) return

      // some wiggle room left, add it back to "needy" columns
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
      let r = ''
      for (let col of columns) {
        const width = col.width!
        let c = (row as any)[col.key].padEnd(width)
        if (c.length > width) {
          c = c.slice(0, width - 2) + '… '
        }
        r += c
      }
      options.printLine(r)
    }
  }
}

export function table<T extends object>(data: T[], columns: table.Columns<T>, options: table.Options = {}) {
  new Table(data, columns, options).display()
}
export namespace table {
  export const flags = {
    columns: Flags.string({exclusive: ['extra'], description: 'only show provided columns (comma-seperated)'}),
    sort: Flags.string({description: 'property to sort by (prepend \'-\' for descending)'}),
    filter: Flags.string({description: 'filter property by partial string matching, ex: name=foo'}),
    csv: Flags.boolean({exclusive: ['no-truncate'], description: 'output is csv format'}),
    extra: Flags.boolean({char: 'x', description: 'show all properties'}),
    'no-truncate': Flags.boolean({exclusive: ['csv'], description: 'do not truncate output to fit screen'}),
    'no-header': Flags.boolean({exclusive: ['csv'], description: 'hide table header from output'}),
  }

  export type Columns<T extends object> = { [key: string]: Partial<Column<T>> }

  export interface Column<T extends object> {
    header: string
    extra: boolean
    minWidth: number
    get(row: T): any
  }

  export interface Options {
    [key: string]: any,
    sort?: string,
    filter?: string,
    columns?: string,
    extra?: boolean,
    'no-truncate'?: boolean,
    csv?: boolean,
    'no-header'?: boolean,
    printLine?(s: any): any,
  }
}
