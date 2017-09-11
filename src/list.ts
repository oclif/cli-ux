import { stdtermwidth } from './screen'
import { deps } from './deps'

function linewrap(length: number, s: string): string {
  const lw = require('@heroku/linewrap')
  return lw(length, stdtermwidth, {
    skipScheme: 'ansi-color',
  })(s).trim()
}

export type IListItem = [string, string | undefined]
export type IList = IListItem[]
export function renderList(items: IListItem[]): string {
  if (items.length === 0) {
    return ''
  }
  const maxLength = (deps.maxBy(items, '[0].length') as any)[0].length
  const lines = items.map(i => {
    let left = i[0]
    let right = i[1]
    if (!right) {
      return left
    }
    left = `${deps.padEnd(left, maxLength)}`
    right = linewrap(maxLength + 2, right)
    return `${left}  ${right}`
  })
  return lines.join('\n')
}
