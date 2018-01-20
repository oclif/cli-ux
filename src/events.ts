import * as Errors from './errors'
import * as Output from './output'

export interface Events {
  output: Output.Message | Errors.Message
  error: Error
}

export interface IEventEmitter {
  on<K extends keyof Events>(event: K, fn: (msg: Events[K]) => void): void
  emit<K extends keyof Events>(event: K, msg: Events[K]): void
  removeListener<K extends keyof Events>(event: K, fn: any): void
}
