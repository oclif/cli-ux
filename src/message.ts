import {Levels} from './config'

export interface ConfigMessage {
  type: 'config'
  prop: string
  value: any
}

export type OutputMessage = {
  type: 'output'
  scope: string | undefined
  severity: 'trace'
  input: any[]
} | {
  type: 'output'
  scope: string | undefined
  severity: 'debug'
  input: any[]
} | {
  type: 'output'
  scope: string | undefined
  severity: 'info'
  input: any[]
}

export type ErrorMessage = {
  type: 'error'
  scope: string | undefined
  severity: 'warn'
  error: Error
} | {
  type: 'error'
  scope: string | undefined
  severity: 'error'
  error: Error
} | {
  type: 'error'
  scope: string | undefined
  severity: 'fatal'
  error: Error
}

export interface LoggerMessage {
  type: 'logger'
  scope: string | undefined
  message: string
  severity: Levels
}

export interface DoneMessage {
  type: 'done'
}

export type Message = OutputMessage | ErrorMessage | ConfigMessage | LoggerMessage | DoneMessage
