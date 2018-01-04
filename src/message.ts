export type Level = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
import {ActionMessage} from './action/base'

export interface ILineMessage {
  type: 'line'
  content: string
}

export type LineMessage = ILineMessage & ({
  level: 'trace'
} | {
  level: 'debug'
} | {
  level: 'info'
} | {
  level: 'warn'
  error: Error
} | {
  level: 'error'
  error: Error
} | {
  level: 'fatal'
  error: Error
})

export type Message = LineMessage | ActionMessage

export function levelInt (l: Level): number {
  switch (l) {
    case 'trace':
      return 0
    case 'debug':
      return 1
    case 'info':
      return 2
    case 'warn':
      return 3
    case 'error':
      return 4
    case 'fatal':
      return 5
  }
}
export function levelGte (a: Level, b: Level) {
  return levelInt(a) >= levelInt(b)
}
