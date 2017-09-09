export class ExitError extends Error {
  public code: number
  public stdout: string | undefined
  public stderr: string | undefined

  constructor(code: number, stdout?: string, stderr?: string) {
    super(`Exited with code: ${code}`)
    this.code = code
    this.stdout = stdout
    this.stderr = stderr
  }
}
