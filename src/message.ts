export enum Level {
  trace,
  debug,
  info,
  warn,
  error,
}

export default interface Message {
  content: string
  level: Level
}
