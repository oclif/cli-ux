import { Base } from '../base'
import { Config } from '../config'

export function shouldDisplaySpinner(): boolean {
  return (
    !process.env.DEBUG &&
    !Config.mock &&
    !Config.debug &&
    !!process.stdin.isTTY &&
    !!process.stderr.isTTY &&
    !process.env.CI &&
    process.env.TERM !== 'dumb'
  )
}

export interface ITask {
  action: string
  status: string | undefined
  active: boolean
}

export class ActionBase extends Base {
  public start(action: string, status?: string) {
    const task = (this.task = { action, status, active: !!(this.task && this.task.active) })
    this._start()
    task.active = true
    this.log(task)
  }

  public stop(msg: string = 'done') {
    const task = this.task
    if (!task) {
      return
    }
    // TODO: is this right?
    this.status = msg
    this._stop()
    task.active = false
    delete this.task
  }

  private get globals(): any {
    const globals = ((<any>global)['cli-ux'] = (<any>global)['cli-ux'] || {})
    globals.action = globals.action || {}
    return globals
  }

  public get task(): ITask | undefined {
    return this.globals.action.task
  }

  public set task(task: ITask | undefined) {
    this.globals.action.task = task
  }

  get running(): boolean {
    return !!this.task
  }

  get status(): string | undefined {
    return this.task ? this.task.status : undefined
  }
  set status(status: string | undefined) {
    const task = this.task
    if (!task) {
      return
    }
    if (task.status === status) {
      return
    }
    this._updateStatus(status, task.status)
    task.status = status
    this.log(task)
  }

  public async pauseAsync(fn: () => Promise<any>, icon?: string) {
    const task = this.task
    const active = task && task.active
    if (task && active) {
      this._pause(icon)
      task.active = false
    }
    const ret = await fn()
    if (task && active) {
      this._resume()
    }
    return ret
  }

  public pause(fn: () => any, icon?: string) {
    const task = this.task
    const active = task && task.active
    if (task && active) {
      this._pause(icon)
      task.active = false
    }
    const ret = fn()
    if (task && active) {
      this._resume()
    }
    return ret
  }

  protected log({ action, status }: { action: string; status?: string }) {
    const msg = status ? `${action}... ${status}\n` : `${action}...\n`
    this.stderr.writeLogFile(msg, true)
  }

  protected _start() {
    throw new Error('not implemented')
  }
  protected _stop() {
    throw new Error('not implemented')
  }
  protected _resume() {
    if (this.task) this.start(this.task.action, this.task.status)
  }
  protected _pause(icon?: string) {
    throw new Error('not implemented')
  }
  protected _updateStatus(status: string | undefined, prevStatus?: string) {}
}
