import StreamOutput from './stream'

export default abstract class Base {
  constructor (readonly stdout: StreamOutput, readonly stderr: StreamOutput) {}
}
