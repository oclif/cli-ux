// tslint:disable restrict-plus-operands

import chalk from 'chalk'
import util from 'util'

import cli from '..'

export default function styledJSON(obj: any) {
  const json = util.inspect(obj)
  if (!chalk.enabled) {
    cli.info(json)
    return
  }
  const cardinal = require('cardinal')
  const theme = require('cardinal/themes/jq')
  cli.info(cardinal.highlight(json, {json: true, theme}))
}
