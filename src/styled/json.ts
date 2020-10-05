// tslint:disable restrict-plus-operands

import chalk from 'chalk'
import util from 'util'

function info(format: string, ...args: string[]) {
  process.stdout.write(util.format(format, ...args) + '\n')
}

export default function styledJSON(obj: any) {
  const json = JSON.stringify(obj, null, 2)
  if (!chalk.level) {
    info(json)
    return
  }
  const cardinal = require('cardinal')
  const theme = require('cardinal/themes/jq')
  info(cardinal.highlight(json, {json: true, theme}))
}
