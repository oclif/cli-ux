import deps from './deps'

export interface IPromptOptions {
  prompt?: string
  type?: 'normal' | 'mask' | 'hide'
}

interface IPromptConfig {
  name: string
  prompt: string
  type: 'normal' | 'mask' | 'hide'
  isTTY: boolean
}

export default class Prompt extends deps.Base {
  public prompt(name: string, inputOptions: Partial<IPromptOptions> = {}): Promise<string> {
    const options: IPromptConfig = {
      isTTY: !!(process.env.TERM !== 'dumb' && process.stdin.isTTY),
      name,
      prompt: name ? deps.chalk.dim(`${name}: `) : deps.chalk.dim('> '),
      type: 'normal',
      ...inputOptions,
    }
    switch (options.type) {
      case 'normal':
        return this.normal(options)
      case 'mask':
      case 'hide':
        return deps.passwordPrompt(options.prompt, { method: options.type })
      default:
        throw new Error(`unexpected type ${options.type}`)
    }
  }

  private normal(options: IPromptConfig, retries = 100): Promise<string> {
    if (retries < 0) throw new Error('no input')
    return new Promise(resolve => {
      process.stdin.setEncoding('utf8')
      this.stderr.write(options.prompt)
      process.stdin.resume()
      process.stdin.once('data', data => {
        process.stdin.pause()
        data = data.trim()
        if (data === '') {
          resolve(this.normal(options, retries - 1))
        } else {
          resolve(data)
        }
      })
    })
  }
}
