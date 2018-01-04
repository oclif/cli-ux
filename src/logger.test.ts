import * as fs from 'fs-extra'
import * as path from 'path'
import {of} from 'rxjs/observable/of'

import logger from './logger'
import {Message} from './message'

let log: string
beforeEach(() => {
  log = path.join(global.testRoot, 'error.log')
})

test('writes stuff out', async () => {
  await of(
    {type: 'line', level: 'debug', content: 'content'} as Message,
    {type: 'line', level: 'info', content: 'content'} as Message,
    {type: 'line', level: 'warn', content: 'content', error: new Error()},
  )
    .pipe(
      logger(path.join(global.testRoot, 'error.log'), 'info')
    ).toPromise()
  expect(fs.readFileSync(log, 'utf8')).toContain('] info content')
})

test('does not create file if no output', async () => {
  await of(
    {type: 'line', level: 'debug', content: 'content'} as Message,
    {type: 'line', level: 'info', content: 'content'} as Message,
    {type: 'line', level: 'warn', content: 'content', error: new Error()},
  )
    .pipe(
      logger(path.join(global.testRoot, 'error.log'), 'error')
    ).toPromise()
  expect(fs.existsSync(log)).toEqual(false)
})
