import StreamOutput from './stream'
import deps from './deps'
import * as EventEmitter from 'events'

export default abstract class Base extends EventEmitter {
  public stdout: StreamOutput
  public stderr: StreamOutput
  public config: typeof deps.Config

  constructor() {
    super()
    this.config = deps.Config
    this.stdout = new deps.StreamOutput('stdout', process.stdout)
    this.stderr = new deps.StreamOutput('stderr', process.stderr)
  }
}
