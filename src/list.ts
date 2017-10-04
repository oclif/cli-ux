import screen from './screen'
import _ from 'ts-lodash'

function linewrap(length: number, s: string): string {
  const lw = require('@heroku/linewrap')
  return lw(length, screen.stdtermwidth, {
    skipScheme: 'ansi-color',
  })(s).trim()
}

export type IListItem = [string, string | undefined]
export type IList = IListItem[]
export function renderList(items: IListItem[]): string {
  if (items.length === 0) {
    return ''
  }
  const maxLength = (_.maxBy(items, '[0].length') as any)[0].length
  const lines = items.map(i => {
    let left = i[0]
    let right = i[1]
    if (!right) {
      return left
    }
    left = `${_.padEnd(left, maxLength)}`
    right = linewrap(maxLength + 2, right)
    return `${left}  ${right}`
  })
  return lines.join('\n')
}
