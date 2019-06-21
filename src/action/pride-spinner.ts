// tslint:disable restrict-plus-operands

import chalk from 'chalk'
import * as supportsColor from 'supports-color'

import SpinnerAction from './spinner'

function colorLookup(s: string, frameIndex: number): string {
  // console.log(frameIndex)
  const colors = [
    chalk.red,
    chalk.keyword('orange'),
    chalk.yellow,
    chalk.green,
    chalk.cyan,
    chalk.blue,
    chalk.magenta,
    chalk.keyword('pink'),
  ]
  return color(s, colors[frameIndex])
}
function color(s: string, colorFn: (s: string) => string): string {
  if (!supportsColor) return s
  let has256 = supportsColor.stdout.has256 || (process.env.TERM || '').indexOf('256') !== -1
  return has256 ? colorFn(s) : chalk.magenta(s)
}

export default class PrideSpinnerAction extends SpinnerAction {
  protected _frame(): string {
    let frame = this.frames[this.frameIndex]
    this.frameIndex = ++this.frameIndex % this.frames.length
    return colorLookup(frame, this.frameIndex)
  }
}
