import { ActionBase } from './base'
import { Config } from '../config'
import screen from '../screen'
import * as supportsColor from 'supports-color'
const ansiEscapes = require('ansi-escapes')
import stripAnsi = require('strip-ansi')
import * as ansiStyles from 'ansi-styles'
import * as chalk from 'chalk'

function color(s: string): string {
  if (!supportsColor) return s
  let has256 = supportsColor.has256 || (process.env.TERM || '').indexOf('256') !== -1
  return has256 ? '\u001b[38;5;104m' + s + ansiStyles.reset.open : chalk.magenta(s)
}

export class SpinnerAction extends ActionBase {
  spinner: number
  frames: any
  frameIndex: number
  output: string | undefined

  constructor() {
    super()
    this.frames = require('./spinners')[Config.windows ? 'line' : 'dots2'].frames
    this.frameIndex = 0
  }

  _start() {
    this._reset()
    if (this.spinner) clearInterval(this.spinner)
    this._render()
    let interval: any = (this.spinner = setInterval(this._render.bind(this), Config.windows ? 500 : 100, 'spinner'))
    interval.unref()
  }

  _stop() {
    clearInterval(this.spinner)
    this._render()
    delete this.output
  }

  _pause(icon?: string) {
    clearInterval(this.spinner)
    this._reset()
    if (icon) this._render(` ${icon}`)
    delete this.output
  }

  _render(icon?: string) {
    const task = this.task
    if (!task) return
    this._reset()
    let frame = icon === 'spinner' ? ` ${this._frame()}` : icon || ''
    let status = task.status ? ` ${task.status}` : ''
    this.output = `${task.action}...${frame}${status}\n`
    this._write(this.output)
  }

  _reset() {
    if (!this.output) return
    let lines = this._lines(this.output)
    this._write(ansiEscapes.cursorLeft + ansiEscapes.cursorUp(lines) + ansiEscapes.eraseDown)
    delete this.output
  }

  _frame(): string {
    let frame = this.frames[this.frameIndex]
    this.frameIndex = ++this.frameIndex % this.frames.length
    return color(frame)
  }

  _lines(s: string): number {
    return stripAnsi(s)
      .split('\n')
      .map(l => Math.ceil(l.length / screen.errtermwidth))
      .reduce((c, i) => c + i, 0)
  }

  _write(s: string) {
    this.stderr.write(s, { log: false })
  }
}
