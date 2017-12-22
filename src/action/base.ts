import deps from '../deps'

export function getSpinner(): ActionBase {
  let Action: typeof ActionBase
  if (deps.Config.debug) Action = require('./debug').DebugAction
  else if (
    !deps.Config.mock &&
    !!process.stdin.isTTY &&
    !!process.stderr.isTTY &&
    !process.env.CI &&
    process.env.TERM !== 'dumb'
  )
    Action = require('./spinner').SpinnerAction
  else Action = require('./simple').SimpleAction
  return new Action()
}

export interface ITask {
  action: string
  status: string | undefined
  active: boolean
}

export class ActionBase extends deps.Base {
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
    this._stop(msg)
    task.active = false
    this.task = undefined
  }

  private get globals(): { action: { task?: ITask }; output: string | undefined } {
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

  protected get output(): string | undefined {
    return this.globals.output
  }
  protected set output(output: string | undefined) {
    this.globals.output = output
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
  protected _stop(status: string) {
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
