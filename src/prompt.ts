import chalk from 'chalk'

import config from './config'
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

export default {
  prompt(name: string, options: IPromptOptions = {}) {
    return config.action.pauseAsync(() => {
      return _prompt(name, options)
    }, chalk.cyan('?'))
  },
  confirm(message: string): Promise<boolean> {
    return config.action.pauseAsync(async () => {
      const confirm = async (): Promise<boolean> => {
        let response = (await _prompt(message)).toLowerCase()
        if (['n', 'no'].includes(response)) return false
        if (['y', 'yes'].includes(response)) return true
        return confirm()
      }
      return confirm()
    }, chalk.cyan('?'))
  }
}

function _prompt(name: string, inputOptions: Partial<IPromptOptions> = {}): Promise<string> {
  const options: IPromptConfig = {
    isTTY: !!(process.env.TERM !== 'dumb' && process.stdin.isTTY), name,
    prompt: name ? chalk.dim(`${name}: `) : chalk.dim('> '),
    type: 'normal',
    ...inputOptions,
  }
  switch (options.type) {
    case 'normal':
      return normal(options)
    case 'mask':
    case 'hide':
      return deps.passwordPrompt(options.prompt, {method: options.type})
    default:
      throw new Error(`unexpected type ${options.type}`)
  }
}

function normal(options: IPromptConfig, retries = 100): Promise<string> {
  if (retries < 0) throw new Error('no input')
  return new Promise(resolve => {
    process.stdin.setEncoding('utf8')
    process.stderr.write(options.prompt)
    process.stdin.resume()
    process.stdin.once('data', data => {
      process.stdin.pause()
      data = data.trim()
      if (data === '') {
        resolve(normal(options, retries - 1))
      } else {
        resolve(data)
      }
    })
  })
}
