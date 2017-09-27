import { ActionBase } from './base'
import { IBaseOptions } from '../base'
import { deps } from '../deps'
import { windows } from '../config'
import screen from '../screen'

function color(s: string): string {
  if (!deps.supportsColor) return s
  let has256 = deps.supportsColor.has256 || (process.env.TERM || '').indexOf('256') !== -1
  return has256 ? '\u001b[38;5;104m' + s + deps.ansiStyles.reset.open : deps.chalk.magenta(s)
}

export class SpinnerAction extends ActionBase {
  spinner: number
  frames: any
  frameIndex: number
  output: string | undefined

  constructor(options: Partial<IBaseOptions> = {}) {
    super(options)
    this.frames = require('./spinners')[windows ? 'line' : 'dots2'].frames
    this.frameIndex = 0
  }

  _start() {
    this._reset()
    if (this.spinner) clearInterval(this.spinner)
    this._render()
    let interval: any = (this.spinner = setInterval(this._render.bind(this), windows ? 500 : 100, 'spinner'))
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
    this._write(deps.ansiEscapes.cursorLeft + deps.ansiEscapes.cursorUp(lines) + deps.ansiEscapes.eraseDown)
    delete this.output
  }

  _frame(): string {
    let frame = this.frames[this.frameIndex]
    this.frameIndex = ++this.frameIndex % this.frames.length
    return color(frame)
  }

  _lines(s: string): number {
    return deps
      .stripAnsi(s)
      .split('\n')
      .map(l => Math.ceil(l.length / screen.errtermwidth))
      .reduce((c, i) => c + i, 0)
  }

  _write(s: string) {
    this.stderr.write(s, { log: false })
  }
}
