import deps from '../deps'
import StreamOutput from '../stream'

export interface IAction {
  status: string | undefined
  start(msg: string, status?: string): void
  stop(status?: string): void
}

export type ActionMessage = {
  type: 'action_start'
  content: string
  status?: string
} | {
  type: 'action_stop'
  status: string
} | {
  type: 'action_status'
  status: string | undefined
}

export function getSpinner(stdout: StreamOutput, stderr: StreamOutput): ActionBase {
  let Action: typeof ActionBase
  if (deps.config.debug) Action = require('./debug').DebugAction
  else if (
    !deps.config.mock &&
    !!process.stdin.isTTY &&
    !!process.stderr.isTTY &&
    !process.env.CI &&
    process.env.TERM !== 'dumb'
  )
    Action = require('./spinner').SpinnerAction
  else Action = require('./simple').SimpleAction
  return new Action(stdout, stderr)
}

export interface ITask {
  action: string
  status: string | undefined
  active: boolean
}

export type ActionType = 'spinner' | 'simple' | 'debug'

export class ActionBase extends deps.Base {
  type: ActionType

  public start(action: string, status?: string) {
    const task = (this.task = { action, status, active: !!(this.task && this.task.active) })
    this._start()
    task.active = true
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

  private get globals() {
    const globals = global['cli-ux'] = global['cli-ux'] || {}
    globals.action = globals.action || {}
    return globals
  }

  public get task(): ITask | undefined {
    return this.globals.action!.task
  }

  public set task(task: ITask | undefined) {
    this.globals.action!.task = task
  }

  protected get output(): string | undefined {
    return this.globals.action!.output
  }
  protected set output(output: string | undefined) {
    this.globals.action!.output = output
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
