// tslint:disable restrict-plus-operands

import {magenta} from 'picocolors'

import deps from '../deps'

import {ActionBase, ActionType} from './base'
/* eslint-disable-next-line node/no-missing-require */
const spinners = require('./spinners')

export default class SpinnerAction extends ActionBase {
  public type: ActionType = 'spinner'

  spinner?: NodeJS.Timeout

  frames: any

  frameIndex: number

  constructor() {
    super()
    this.frames = spinners[process.platform === 'win32' ? 'line' : 'dots2'].frames
    this.frameIndex = 0
  }

  protected _start() {
    this._reset()
    if (this.spinner) clearInterval(this.spinner)
    this._render()
    this.spinner = setInterval(icon =>
      this._render.bind(this)(icon),
    process.platform === 'win32' ? 500 : 100,
    'spinner',
    )
    const interval = this.spinner
    interval.unref()
  }

  protected _stop(status: string) {
    if (this.task) this.task.status = status
    if (this.spinner) clearInterval(this.spinner)
    this._render()
    this.output = undefined
  }

  protected _pause(icon?: string) {
    if (this.spinner) clearInterval(this.spinner)
    this._reset()
    if (icon) this._render(` ${icon}`)
    this.output = undefined
  }

  protected _frame(): string {
    const frame = this.frames[this.frameIndex]
    this.frameIndex = ++this.frameIndex % this.frames.length
    return magenta(frame)
  }

  private _render(icon?: string) {
    const task = this.task
    if (!task) return
    this._reset()
    this._flushStdout()
    const frame = icon === 'spinner' ? ` ${this._frame()}` : icon || ''
    const status = task.status ? ` ${task.status}` : ''
    this.output = `${task.action}...${frame}${status}\n`
    this._write(this.std, this.output)
  }

  private _reset() {
    if (!this.output) return
    const lines = this._lines(this.output)
    this._write(this.std, deps.ansiEscapes.cursorLeft + deps.ansiEscapes.cursorUp(lines) + deps.ansiEscapes.eraseDown)
    this.output = undefined
  }

  private _lines(s: string): number {
    return deps
    .stripAnsi(s)
    .split('\n')
    .map(l => Math.ceil(l.length / deps.screen.errtermwidth))
    .reduce((c, i) => c + i, 0)
  }
}
