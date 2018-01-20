// tslint:disable restrict-plus-operands

import chalk from 'chalk'

import cli from '..'

export default function styledJSON(obj: any) {
  let json = JSON.stringify(obj, null, 2)
  if (!chalk.enabled) {
    cli.info(json)
    return
  }
  let cardinal = require('cardinal')
  let theme = require('cardinal/themes/jq')
  cli.info(cardinal.highlight(json, {json: true, theme}) + '\n')
}
