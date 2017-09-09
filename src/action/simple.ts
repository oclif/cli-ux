import { ActionBase } from './base'

export class SimpleAction extends ActionBase {
  _start() {
    const task = this.task
    if (!task) return
    this._render(task.action, task.status)
  }

  _pause(icon?: string) {
    if (icon) this._updateStatus(icon)
    this._write('\n')
  }

  _resume() {}

  _updateStatus(status: string, prevStatus?: string) {
    const task = this.task
    if (!task) return
    if (task.active && !prevStatus) this._write(` ${status}`)
    else this._render(task.action, status)
  }

  _stop() {
    this._write('\n')
  }

  _render(action: string, status?: string) {
    const task = this.task
    if (!task) return
    if (task.active) this._write('\n')
    this._write(status ? `${action}... ${status}` : `${action}...`)
  }

  _write(s: string) {
    this.stderr.write(s, { log: false })
  }
}

// export class SpinnerAction extends ActionBase {
//   spinner: number
//   ansi: any
//   frames: any
//   frameIndex: number
//   output: ?string
//   width: number

//   constructor (out: Output) {
//     super(out)
//     this.ansi = require('ansi-escapes')
//     this.frames = require('./spinners.js')[process.platform === 'win32' ? 'line' : 'dots2'].frames
//     this.frameIndex = 0
//     const screen = require('./screen')
//     this.width = screen.errtermwidth
//   }

//   _start () {
//     this._reset()
//     if (this.spinner) clearInterval(this.spinner)
//     this._render()
//     let interval: any = this.spinner = setInterval(this._render.bind(this), this.out.config.windows ? 500 : 100, 'spinner')
//     interval.unref()
//   }

//   _stop () {
//     clearInterval(this.spinner)
//     this._render()
//     this.output = null
//   }

//   _pause (icon: ?string) {
//     clearInterval(this.spinner)
//     this._reset()
//     if (icon) this._render(` ${icon}`)
//     this.output = null
//   }

//   _render (icon: ?string) {
//     const task = this.task
//     if (!task) return
//     this._reset()
//     let frame = icon === 'spinner'
//       ? ` ${this._frame()}`
//       : icon || ''
//     let status = task.status ? ` ${task.status}` : ''
//     this.output = `${task.action}...${frame}${status}\n`
//     this._write(this.output)
//   }

//   _reset () {
//     if (!this.output) return
//     let lines = this._lines(this.output)
//     this._write(this.ansi.cursorLeft +
//       this.ansi.cursorUp(lines) +
//       this.ansi.eraseDown)
//     this.output = null
//   }

//   _frame (): string {
//     let frame = this.frames[this.frameIndex]
//     this.frameIndex = ++this.frameIndex % this.frames.length
//     return this.out.color.heroku(frame)
//   }

//   _lines (s: string): number {
//     return this.out.color.stripColor(s)
//       .split('\n')
//       .map(l => Math.ceil(l.length / this.width))
//       .reduce((c, i) => c + i, 0)
//   }

//   _write (s: string) {
//     this.out.stderr.write(s, {log: false})
//   }
// }
