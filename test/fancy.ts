import chalk from 'chalk'
import {expect, fancy as base, FancyTypes} from 'fancy-test'
import * as fs from 'fs-extra'
import * as path from 'path'

import cli from '../src'

export {
  expect,
  FancyTypes,
}

let count = 0
const logLevel = cli.config.logLevel

export const fancy = base
.do(async (ctx: {count: number, base: string}) => {
  ctx.count = count++
  ctx.base = path.join(__dirname, '../tmp', `test-${ctx.count}`)
  await fs.remove(ctx.base)
  cli.config.errlog = path.join(ctx.base, 'error.log')
  chalk.enabled = false
})
.finally(async () => {
  cli.config.logLevel = logLevel
  await cli.done()
})
