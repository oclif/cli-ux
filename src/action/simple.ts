import { ActionBase } from './base'

export class SimpleAction extends ActionBase {
  _start() {
    const task = this.task
    if (!task) return
    this._render(task.action, task.status)
  }

  _pause(icon?: string) {
    if (icon) this._updateStatus(icon)
    else this._write('\n')
  }

  _resume() {}

  _updateStatus(status: string, prevStatus?: string, newline: boolean = false) {
    const task = this.task
    if (!task) return
    if (task.active && !prevStatus) this._write(` ${status}`)
    else this._write(`${task.action}... ${status}`)
    if (newline || !prevStatus) this._write('\n')
  }

  _stop(status: string) {
    const task = this.task
    if (!task) return
    this._updateStatus(status, task.status, true)
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
