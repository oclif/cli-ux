// tslint:disable restrict-plus-operands

import {blue, cyan, green, magenta, red, yellow, isColorSupported} from 'picocolors'

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

  if (!isColorSupported) return s
  const prideColor = prideColors[frameIndex] || prideColors[0]
  return prideColor(s)
}

export default class PrideSpinnerAction extends SpinnerAction {
  protected _frame(): string {
    const frame = this.frames[this.frameIndex]
    this.frameIndex = ++this.frameIndex % this.frames.length
    return color(frame, this.frameIndex)
  }
}
