import StreamOutput from './stream'
import deps from './deps'

export default abstract class Base {
  public stdout: StreamOutput
  public stderr: StreamOutput
  public config: typeof deps.Config

  constructor() {
    this.config = deps.Config
    this.stdout = new deps.StreamOutput('stdout', process.stdout)
    this.stderr = new deps.StreamOutput('stderr', process.stderr)
  }
}
