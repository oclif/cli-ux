// tslint:disable restrict-plus-operands

import {blue, cyan, green, magenta, red, yellow} from 'colorette'
import * as supportsColor from 'supports-color'

import SpinnerAction from './spinner'

function color(s: string, frameIndex: number): string {
  const prideColors = [
    red,
    yellow,
    green,
    cyan,
    blue,
    magenta,
  ]

  if (!supportsColor) return s
  const has256 = supportsColor.stdout.has256 || (process.env.TERM || '').indexOf('256') !== -1
  const prideColor = prideColors[frameIndex] || prideColors[0]
  return has256 ? prideColor(s) : magenta(s)
}

export default class PrideSpinnerAction extends SpinnerAction {
  protected _frame(): string {
    const frame = this.frames[this.frameIndex]
    this.frameIndex = ++this.frameIndex % this.frames.length
    return color(frame, this.frameIndex)
  }
}
