import * as _ from 'lodash'
import {inspect} from 'util'

export interface ITask {
  action: string
  status: string | undefined
  active: boolean
}

export type ActionType = 'spinner' | 'simple' | 'debug'

export interface Options {
  stdout?: boolean
}

export class ActionBase {
  type!: ActionType
  std: 'stdout' | 'stderr' = 'stderr'
  protected stdmocks?: ['stdout' | 'stderr', string[]][]
  private stdmockOrigs = {
    stdout: process.stdout.write,
    stderr: process.stderr.write,
  }

  public start(action: string, status?: string, opts: Options = {}) {
    this.std = opts.stdout ? 'stdout' : 'stderr'
    const task = (this.task = {action, status, active: !!(this.task && this.task.active)})
    this._start()
    task.active = true
    this._stdout(true)
  }

  public stop(msg: string = 'done') {
    const task = this.task
    if (!task) {
      return
    }
    this._stop(msg)
    task.active = false
    this.task = undefined
    this._stdout(false)
  }

  private get globals(): { action: { task?: ITask }; output: string | undefined } {
    const globals = ((global as any)['cli-ux'] = (global as any)['cli-ux'] || {})
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
  }

  public async pauseAsync(fn: () => Promise<any>, icon?: string) {
    const task = this.task
    const active = task && task.active
    if (task && active) {
      this._pause(icon)
      this._stdout(false)
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
      this._stdout(false)
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
  protected _stop(_: string) {
    throw new Error('not implemented')
  }
  protected _resume() {
    if (this.task) this.start(this.task.action, this.task.status)
  }
  protected _pause(_?: string) {
    throw new Error('not implemented')
  }
  protected _updateStatus(_: string | undefined, __?: string) {}

  /**
   * mock out stdout/stderr so it doesn't screw up the rendering
   */
  protected _stdout(toggle: boolean) {
    try {
      const outputs: ['stdout', 'stderr'] = ['stdout', 'stderr']
      if (toggle) {
        if (this.stdmocks) return
        this.stdmockOrigs = {
          stdout: process.stdout.write,
          stderr: process.stderr.write,
        }

        this.stdmocks = []
        for (let std of outputs) {
          (process[std] as any).write = (...args: any[]) => {
            this.stdmocks!.push([std, args] as ['stdout' | 'stderr', string[]])
          }
        }
      } else {
        if (!this.stdmocks) return
        // this._write('stderr', '\nresetstdmock\n\n\n')
        delete this.stdmocks
        for (let std of outputs) process[std].write = this.stdmockOrigs[std] as any
      }
    } catch (err) {
      this._write('stderr', inspect(err))
    }
  }

  /**
   * flush mocked stdout/stderr
   */
  protected _flushStdout() {
    try {
      let output = ''
      let std: 'stdout' | 'stderr' | undefined
      while (this.stdmocks && this.stdmocks.length) {
        let cur = this.stdmocks.shift() as ['stdout' | 'stderr', string[]]
        std = cur[0]
        this._write(std, cur[1])
        output += cur[1].map((a: any) => a.toString('utf8')).join('')
      }
      // add newline if there isn't one already
      // otherwise we'll just overwrite it when we render
      if (output && std && output[output.length - 1] !== '\n') {
        this._write(std, '\n')
      }
    } catch (err) {
      this._write('stderr', inspect(err))
    }
  }

  /**
   * write to the real stdout/stderr
   */
  protected _write(std: 'stdout' | 'stderr', s: string | string[]) {
    this.stdmockOrigs[std].apply(process[std], _.castArray(s))
  }
}
