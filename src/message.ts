import {Levels} from './config'

export interface ConfigMessage {
  type: 'config'
  prop: string
  value: any
}

export type OutputMessage = {
  type: 'output'
  severity: 'trace'
  input: any[]
} | {
  type: 'output'
  severity: 'debug'
  input: any[]
} | {
  type: 'output'
  severity: 'info'
  input: any[]
}

export type ErrorMessage = {
  type: 'error'
  severity: 'warn'
  error: Error
} | {
  type: 'error'
  severity: 'error'
  error: Error
} | {
  type: 'error'
  severity: 'fatal'
  error: Error
}

export interface LoggerMessage {
  type: 'logger'
  message: string
  severity: Levels
}

export interface DoneMessage {
  type: 'done'
}

export type Message = OutputMessage | ErrorMessage | ConfigMessage | LoggerMessage | DoneMessage
