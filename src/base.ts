import { StreamOutput } from './stream'
import { Config } from './config'

export abstract class Base {
  public stdout: StreamOutput
  public stderr: StreamOutput
  public config: typeof Config

  constructor() {
    this.config = Config
    this.stdout = new StreamOutput('stdout', process.stdout)
    this.stderr = new StreamOutput('stderr', process.stderr)
  }
}
