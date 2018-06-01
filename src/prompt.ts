import chalk from 'chalk'

import config from './config'
import deps from './deps'

export interface IPromptOptions {
  prompt?: string
  type?: 'normal' | 'mask' | 'hide'
  timeout?: number
  /**
   * Requires user input if true, otherwise allows empty input
   */
  required?: boolean
  default?: string
}

interface IPromptConfig {
  name: string
  prompt: string
  type: 'normal' | 'mask' | 'hide'
  isTTY: boolean
  required: boolean
  default?: string
  timeout?: number
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
  let prompt = '> '
  if (name && inputOptions.default) prompt = name + ' ' + chalk.yellow('[' + inputOptions.default + ']') + ': '
  else if (name) prompt = `${name}: `
  const options: IPromptConfig = {
    isTTY: !!(process.env.TERM !== 'dumb' && process.stdin.isTTY),
    name,
    prompt,
    type: 'normal',
    required: true,
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
  return new Promise((resolve, reject) => {
    process.stdin.setEncoding('utf8')
    process.stderr.write(options.prompt)
    process.stdin.resume()
    process.stdin.once('data', data => {
      process.stdin.pause()
      data = data.trim()
      if (!options.default && options.required && data === '') {
        resolve(normal(options, retries - 1))
      } else {
        resolve(data || options.default)
      }
    })
    setTimeout(() => reject(), options.timeout || 10000).unref()
  })
}
