// tslint:disable restrict-plus-operands

import chalk from 'chalk'

import cli from '..'

export default function styledJSON(obj: any) {
  const json = JSON.stringify(obj, null, 2)
  if (!chalk.level) {
    cli.info(json)
    return
  }

  const cardinal = require('cardinal')
  const theme = require('cardinal/themes/jq')
  cli.info(cardinal.highlight(json, {json: true, theme}))
}
