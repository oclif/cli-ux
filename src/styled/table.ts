import {flags as F} from '@oclif/command'
import {stdtermwidth} from '@oclif/screen'
import chalk from 'chalk'
import capitalize from 'lodash/capitalize'
import sumBy from 'lodash/sumBy'
import {safeDump} from 'js-yaml'
import {inspect} from 'util'

const sw = require('string-width')
const {orderBy} = require('natural-orderby')

class Table<T extends object> {
  options: table.Options & { printLine(s: any): any }

  columns: (table.Column<T> & { key: string; width?: number; maxWidth?: number })[]

  constructor(private data: T[], columns: table.Columns<T>, options: table.Options = {}) {
    // assign columns
    this.columns = Object.keys(columns).map((key: string) => {
      const col = columns[key]
      const extended = col.extended || false
      const get = col.get || ((row: any) => row[key])
      const header = typeof col.header === 'string' ? col.header : capitalize(key.replace(/_/g, ' '))
      const minWidth = Math.max(col.minWidth || 0, sw(header) + 1)

      return {
        extended,
        get,
        header,
        key,
        minWidth,
      }
    })

    // assign options
    const {columns: cols, filter, csv, output, extended, sort, title, printLine} = options
    this.options = {
      columns: cols,
      output: csv ? 'csv' : output,
      extended,
      filter,
      'no-header': options['no-header'] || false,
      'no-truncate': options['no-truncate'] || false,
      printLine: printLine || ((s: any) => process.stdout.write(s + '\n')),
      rowStart: ' ',
      sort,
      title,
    }
  }

  display() {
    // build table rows from input array data
    let rows = this.data.map(d => {
      const row: any = {}
      for (const col of this.columns) {
        let val = col.get(d)
        if (typeof val !== 'string') val = inspect(val, {breakLength: Infinity})
        row[col.key] = val
      }
      return row
    })

    // filter rows
    if (this.options.filter) {
      /* eslint-disable-next-line prefer-const */
      let [header, regex] = this.options.filter!.split('=')
      const isNot = header[0] === '-'
      if (isNot) header = header.substr(1)
      const col = this.findColumnFromHeader(header)
      if (!col || !regex) throw new Error('Filter flag has an invalid value')
      rows = rows.filter((d: any) => {
        const re = new RegExp(regex)
        const val = d[col!.key]
        const match = val.match(re)
        return isNot ? !match : match
      })
    }

    // sort rows
    if (this.options.sort) {
      const sorters = this.options.sort!.split(',')
      const sortHeaders = sorters.map(k => k[0] === '-' ? k.substr(1) : k)
      const sortKeys = this.filterColumnsFromHeaders(sortHeaders).map(c => {
        return ((v: any) => v[c.key])
      })
      const sortKeysOrder = sorters.map(k => k[0] === '-' ? 'desc' : 'asc')
      rows = orderBy(rows, sortKeys, sortKeysOrder)
    }

    // and filter columns
    if (this.options.columns) {
      const filters = this.options.columns!.split(',')
      this.columns = this.filterColumnsFromHeaders(filters)
    } else if (!this.options.extended) {
      // show extented columns/properties
      this.columns = this.columns.filter(c => !c.extended)
    }

    this.data = rows

    switch (this.options.output) {
    case 'csv':
      this.outputCSV()
      break
    case 'json':
      this.outputJSON()
      break
    case 'yaml':
      this.outputYAML()
      break
    default:
      this.outputTable()
    }
  }

  private findColumnFromHeader(header: string): (table.Column<T> & { key: string; width?: number; maxWidth?: number }) | undefined {
    return this.columns.find(c => c.header.toLowerCase() === header.toLowerCase())
  }

  private filterColumnsFromHeaders(filters: string[]): (table.Column<T> & { key: string; width?: number; maxWidth?: number })[] {
    // unique
    filters = [...(new Set(filters))]
    const cols: (table.Column<T> & {key: string; width?: number; maxWidth?: number})[] = []
    filters.forEach(f => {
      const c = this.columns.find(c => c.header.toLowerCase() === f.toLowerCase())
      if (c) cols.push(c)
    })
    return cols
  }

  private getCSVRow(d: any): string[] {
    const values = this.columns.map(col => d[col.key] || '')

    const needToBeEscapedForCsv = (e: string) => {
      // CSV entries containing line breaks, comma or double quotes
      // as specified in https://tools.ietf.org/html/rfc4180#section-2
      return e.includes('"') || e.includes('\n') || e.includes('\r\n') || e.includes('\r') || e.includes(',')
    }

    const lineToBeEscaped = values.find(needToBeEscapedForCsv)
    return values.map(e => lineToBeEscaped ? `"${e.replace('"', '""')}"` : e)
  }

  private resolveColumnsToObjectArray() {
    // tslint:disable-next-line:no-this-assignment
    const {data, columns} = this
    return data.map((d: any) => {
      return columns.reduce((obj, col) => {
        return {
          ...obj,
          [col.key]: d[col.key] || '',
        }
      }, {})
    })
  }

  private outputJSON() {
    this.options.printLine(JSON.stringify(this.resolveColumnsToObjectArray(), undefined, 2))
  }

  private outputYAML() {
    this.options.printLine(safeDump(this.resolveColumnsToObjectArray()))
  }

  private outputCSV() {
    // tslint:disable-next-line:no-this-assignment
    const {data, columns, options} = this

    if (!options['no-header']) {
      options.printLine(columns.map(c => c.header).join(','))
    }
    data.forEach((d: any) => {
      const row = this.getCSVRow(d)
      options.printLine(row.join(','))
    })
  }

  private outputTable() {
    // tslint:disable-next-line:no-this-assignment
    const {data, columns, options} = this

    // column truncation
    //
    // find max width for each column
    for (const col of columns) {
      // convert multi-line cell to single longest line
      // for width calculations
      const widthData = data.map((row: any) => {
        const d = row[col.key]
        const manyLines = d.split('\n')
        if (manyLines.length > 1) {
          return '*'.repeat(Math.max(...manyLines.map((r: string) => sw(r))))
        }
        return d
      })
      const widths = ['.'.padEnd(col.minWidth! - 1), col.header, ...widthData.map((row: any) => row)].map(r => sw(r))
      col.maxWidth = Math.max(...widths) + 1
      col.width = col.maxWidth!
    }
    // terminal width
    const maxWidth = stdtermwidth - 2
    // truncation logic
    const shouldShorten = () => {
      // don't shorten if full mode
      if (options['no-truncate'] || (!process.stdout.isTTY && !process.env.CLI_UX_SKIP_TTY_CHECK)) return

      // don't shorten if there is enough screen width
      const dataMaxWidth = sumBy(columns, c => c.width!)
      const overWidth = dataMaxWidth - maxWidth
      if (overWidth <= 0) return

      // not enough room, short all columns to minWidth
      for (const col of columns) {
        col.width = col.minWidth
      }

      // if sum(minWidth's) is greater than term width
      // nothing can be done so
      // display all as minWidth
      const dataMinWidth = sumBy(columns, c => c.minWidth!)
      if (dataMinWidth >= maxWidth) return

      // some wiggle room left, add it back to "needy" columns
      let wiggleRoom = maxWidth - dataMinWidth
      const needyCols = columns.map(c => ({key: c.key, needs: c.maxWidth! - c.width!})).sort((a, b) => a.needs - b.needs)
      for (const {key, needs} of needyCols) {
        if (!needs) continue
        const col = columns.find(c => key === c.key)
        if (!col) continue
        if (wiggleRoom > needs) {
          col.width = col.width! + needs
          wiggleRoom -= needs
        } else if (wiggleRoom) {
          col.width = col.width! + wiggleRoom
          wiggleRoom = 0
        }
      }
    }
    shouldShorten()

    // print table title
    if (options.title) {
      options.printLine(options.title)
      // print title divider
      options.printLine(''.padEnd(columns.reduce((sum, col) => sum + col.width!, 1), '='))

      options.rowStart = '| '
    }

    // print headers
    if (!options['no-header']) {
      let headers = options.rowStart
      for (const col of columns) {
        const header = col.header!
        const colWidth = col.width! - sw(header) + header.length
        headers += header.padEnd(colWidth)
      }
      options.printLine(chalk.bold(headers))

      // print header dividers
      let dividers = options.rowStart
      for (const col of columns) {
        const divider = ''.padEnd(col.width! - 1, '─') + ' '
        dividers += divider.padEnd(col.width!)
      }
      options.printLine(chalk.bold(dividers))
    }

    // print rows
    for (const row of data) {
      // find max number of lines
      // for all cells in a row
      // with multi-line strings
      let numOfLines = 1
      for (const col of columns) {
        const d = (row as any)[col.key]
        const lines = d.split('\n').length
        if (lines > numOfLines) numOfLines = lines
      }
      const linesIndexess = [...new Array(numOfLines).keys()]

      // print row
      // including multi-lines
      linesIndexess.forEach((i: number) => {
        let l = options.rowStart
        for (const col of columns) {
          const width = col.width!
          let d = (row as any)[col.key]
          d = d.split('\n')[i] || ''
          const visualWidth = sw(d)
          const colorWidth = (d.length - visualWidth)
          let cell = d.padEnd(width + colorWidth)
          if ((cell.length - colorWidth) > width || visualWidth === width) {
            cell = cell.slice(0, width - 2) + '… '
          }
          l += cell
        }
        options.printLine(l)
      })
    }
  }
}

export function table<T extends object>(data: T[], columns: table.Columns<T>, options: table.Options = {}) {
  new Table(data, columns, options).display()
}

export namespace table {
  export const Flags: {
    columns: F.IOptionFlag<string | undefined>;
    sort: F.IOptionFlag<string | undefined>;
    filter: F.IOptionFlag<string | undefined>;
    csv: F.IFlag<boolean>;
    output: F.IOptionFlag<string | undefined>;
    extended: F.IFlag<boolean>;
    'no-truncate': F.IFlag<boolean>;
    'no-header': F.IFlag<boolean>;
  } = {
    columns: F.string({exclusive: ['extended'], description: 'only show provided columns (comma-separated)'}),
    sort: F.string({description: 'property to sort by (prepend \'-\' for descending)'}),
    filter: F.string({description: 'filter property by partial string matching, ex: name=foo'}),
    csv: F.boolean({exclusive: ['no-truncate'], description: 'output is csv format [alias: --output=csv]'}),
    output: F.string({
      exclusive: ['no-truncate', 'csv'],
      description: 'output in a more machine friendly format',
      options: ['csv', 'json', 'yaml'],
    }),
    extended: F.boolean({exclusive: ['columns'], char: 'x', description: 'show extra columns'}),
    'no-truncate': F.boolean({exclusive: ['csv'], description: 'do not truncate output to fit screen'}),
    'no-header': F.boolean({exclusive: ['csv'], description: 'hide table header from output'}),
  }

  type IFlags = typeof Flags
  type ExcludeFlags<T, Z> = Pick<T, Exclude<keyof T, Z>>
  type IncludeFlags<T, K extends keyof T> = Pick<T, K>

  export function flags(): IFlags
  export function flags<Z extends keyof IFlags = keyof IFlags>(opts: { except: Z | Z[] }): ExcludeFlags<IFlags, Z>
  export function flags<K extends keyof IFlags = keyof IFlags>(opts: { only: K | K[] }): IncludeFlags<IFlags, K>
  // eslint-disable-next-line no-inner-declarations
  export function flags(opts?: any): any {
    if (opts) {
      const f = {}
      const o = (opts.only && typeof opts.only === 'string' ? [opts.only] : opts.only) || Object.keys(Flags)
      const e = (opts.except && typeof opts.except === 'string' ? [opts.except] : opts.except) || []
      o.forEach((key: string) => {
        if ((e as any[]).includes(key)) return
        (f as any)[key] = (Flags as any)[key]
      })
      return f
    }
    return Flags
  }

  export type Columns<T extends object> = { [key: string]: Partial<Column<T>> }

  export interface Column<T extends object> {
    header: string;
    extended: boolean;
    minWidth: number;
    get(row: T): any;
  }

  // export type OutputType = 'csv' | 'json' | 'yaml'

  export interface Options {
    [key: string]: any;
    sort?: string;
    filter?: string;
    columns?: string;
    extended?: boolean;
    'no-truncate'?: boolean;
    output?: string;
    'no-header'?: boolean;
    printLine?(s: any): any;
  }
}
