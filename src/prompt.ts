import {error} from '@oclif/errors'
import chalk from 'chalk'

import config from './config'
import deps from './deps'

export interface IPromptOptions {
  prompt?: string;
  type?: 'normal' | 'mask' | 'hide' | 'single';
  timeout?: number;
  /**
   * Requires user input if true, otherwise allows empty input
   */
  required?: boolean;
  default?: string;
}

interface IPromptConfig {
  name: string;
  prompt: string;
  type: 'normal' | 'mask' | 'hide' | 'single';
  isTTY: boolean;
  required: boolean;
  default?: string;
  timeout?: number;
}

/**
 * prompt for input
 */
export function prompt(name: string, options: IPromptOptions = {}) {
  return config.action.pauseAsync(() => {
    return _prompt(name, options)
  }, chalk.cyan('?'))
}

/**
 * confirmation prompt (yes/no)
 */
export function confirm(message: string): Promise<boolean> {
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

/**
 * "press anykey to continue"
 */
export async function anykey(message?: string): Promise<void> {
  const tty = !!process.stdin.setRawMode
  if (!message) {
    message = tty
      ? `Press any key to continue or ${chalk.yellow('q')} to exit`
      : `Press enter to continue or ${chalk.yellow('q')} to exit`
  }
  const char = await prompt(message, {type: 'single', required: false})
  if (tty) process.stderr.write('\n')
  if (char === 'q') error('quit')
  if (char === '\u0003') error('ctrl-c')
  return char
}

function _prompt(name: string, inputOptions: Partial<IPromptOptions> = {}): Promise<string> {
  const prompt = getPrompt(name, inputOptions.type, inputOptions.default)
  const options: IPromptConfig = {
    isTTY: !!(process.env.TERM !== 'dumb' && process.stdin.isTTY),
    name,
    prompt,
    type: 'normal',
    required: true,
    default: '',
    ...inputOptions,
  }
  switch (options.type) {
  case 'normal':
    return normal(options)
  case 'single':
    return single(options)
  case 'mask':
    return deps.passwordPrompt(options.prompt, {
      method: options.type,
      required: options.required,
      default: options.default
    }).then((value: string) => {
      replacePrompt(getPrompt(name, 'hide', inputOptions.default))
      return value
    })
  case 'hide':
    return deps.passwordPrompt(options.prompt, {
      method: options.type,
      required: options.required,
      default: options.default
    })
  default:
    throw new Error(`unexpected type ${options.type}`)
  }
}

async function single(options: IPromptConfig): Promise<string> {
  const raw = process.stdin.isRaw
  if (process.stdin.setRawMode) process.stdin.setRawMode(true)
  const response = await normal({required: false, ...options})
  if (process.stdin.setRawMode) process.stdin.setRawMode(!!raw)
  return response
}

function normal(options: IPromptConfig, retries = 100): Promise<string> {
  if (retries < 0) throw new Error('no input')
  return new Promise((resolve, reject) => {
    let timer: NodeJS.Timer
    if (options.timeout) {
      timer = setTimeout(() => {
        process.stdin.pause()
        reject(new Error('Prompt timeout'))
      }, options.timeout)
      timer.unref()
    }
    process.stdin.setEncoding('utf8')
    process.stderr.write(options.prompt)
    process.stdin.resume()
    process.stdin.once('data', data => {
      if (timer) clearTimeout(timer)
      process.stdin.pause()
      data = data.trim()
      if (!options.default && options.required && data === '') {
        resolve(normal(options, retries - 1))
      } else {
        resolve(data || options.default)
      }
    })
  })
}

function getPrompt(name: string, type?: string, defaultValue?: string) {
  let prompt = '> '

  if (defaultValue && type === 'hide') {
    defaultValue = '*'.repeat(defaultValue.length)
  }

  if (name && defaultValue) prompt = name + ' ' + chalk.yellow('[' + defaultValue + ']') + ': '
  else if (name) prompt = `${name}: `

  return prompt
}

function replacePrompt(prompt: string) {
  process.stderr.write(deps.ansiEscapes.cursorHide + deps.ansiEscapes.cursorUp(1) + deps.ansiEscapes.cursorLeft + prompt
    + deps.ansiEscapes.cursorDown(1) + deps.ansiEscapes.cursorLeft + deps.ansiEscapes.cursorShow)
}
