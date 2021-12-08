// tslint:disable restrict-plus-operands

import chalk from 'chalk'
import * as supportsColor from 'supports-color'

import SpinnerAction from './spinner'

function color(s: string, frameIndex: number): string {
  const prideColors = [
    chalk.keyword('pink'),
    chalk.red,
    chalk.keyword('orange'),
    chalk.yellow,
    chalk.green,
    chalk.cyan,
    chalk.blue,
    chalk.magenta,
  ]

  if (!supportsColor) return s
  const has256 = supportsColor.stdout ? supportsColor.stdout.has256 : (process.env.TERM || '').includes('256')
  const prideColor = prideColors[frameIndex] || prideColors[0]
  return has256 ? prideColor(s) : chalk.magenta(s)
}

export default class PrideSpinnerAction extends SpinnerAction {
  protected _frame(): string {
    const frame = this.frames[this.frameIndex]
    this.frameIndex = ++this.frameIndex % this.frames.length
    return color(frame, this.frameIndex)
  }
}
