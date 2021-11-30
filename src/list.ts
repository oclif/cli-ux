// tslint:disable

import maxBy from 'lodash/maxBy'

import deps from './deps'

function linewrap(length: number, s: string): string {
  const lw = require('@oclif/linewrap')
  return lw(length, deps.screen.stdtermwidth, {
    skipScheme: 'ansi-color',
  })(s).trim()
}

export type IListItem = [string, string | undefined]
export type IList = IListItem[]
export function renderList(items: IListItem[]): string {
  if (items.length === 0) {
    return ''
  }

  const maxLength = (maxBy(items, '[0].length') as any)[0].length
  const lines = items.map(i => {
    let left = i[0]
    let right = i[1]
    if (!right) {
      return left
    }

    left = left.padEnd(maxLength)
    right = linewrap(maxLength + 2, right)
    return `${left}  ${right}`
  })
  return lines.join('\n')
}
