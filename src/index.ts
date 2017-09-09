import { ActionBase, shouldDisplaySpinner } from './action/base'
import { SpinnerAction } from './action/spinner'
import { SimpleAction } from './action/simple'
import { Errors, IWarnOptions } from './errors'
import { Prompt, IPromptOptions } from './prompt'
import { StreamOutput } from './stream'
import { deps } from './deps'

export interface IOptions {
  errlog?: string
  mock?: boolean
  debug?: boolean
}

export class CLI {
  public action: ActionBase
  private stdoutStream: StreamOutput
  private stderrStream: StreamOutput
  private errorsDep: Errors
  private promptDep: Prompt

  constructor(readonly options: IOptions = {}) {
    this.stdoutStream = new StreamOutput(this.options.mock ? undefined : process.stdout)
    this.stderrStream = new StreamOutput(this.options.mock ? undefined : process.stderr)
    const depOpts = {
      debug: !!options.debug,
      mock: !!options.mock,
      stderr: this.stderrStream,
      stdout: this.stdoutStream,
    }
    this.errorsDep = new Errors(depOpts)
    this.promptDep = new Prompt(depOpts)
    this.action = shouldDisplaySpinner(depOpts) ? new SpinnerAction(depOpts) : new SimpleAction(depOpts)
  }

  get stderr(): string {
    const output = this.stderrStream.output
    if (!output) {
      throw new Error('not mocking stderr')
    }
    return output
  }

  get stdout(): string {
    const output = this.stdoutStream.output
    if (!output) {
      throw new Error('not mocking stdout')
    }
    return output
  }

  public prompt(name: string, options: IPromptOptions = {}) {
    return this.action.pauseAsync(() => {
      return this.promptDep.prompt(name, options)
    }, deps.chalk.cyan('?'))
  }

  public log(data: string, ...args: any[]) {
    this.action.pause(() => {
      return this.stdoutStream.log(data, ...args)
    })
  }

  public warn(err: Error | string, options: IWarnOptions = {}) {
    this.action.pause(() => {
      return this.errorsDep.warn(err, options)
    }, deps.chalk.bold.yellow('!'))
  }

  public error(err: Error | string, exitCode: number | false = 1) {
    this.action.pause(() => {
      return this.errorsDep.error(err, exitCode)
    }, deps.chalk.bold.red('!'))
  }
}

export const cli = new CLI()
