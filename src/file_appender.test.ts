import * as fs from 'fs-extra'
import * as path from 'path'
import {Observable} from 'rxjs/observable'
import {of} from 'rxjs/observable/of'

import appendFile from './file_appender'

let log: string
beforeEach(() => {
  log = path.join(global.testRoot, 'error.log')
})

test('writes stuff out', async () => {
  await of('a', 'b', 'c')
    .pipe(
      appendFile(path.join(global.testRoot, 'error.log'))
    ).toPromise()
  expect(fs.readFileSync(log, 'utf8')).toEqual('a\nb\nc\n')
})

test('does not create file if no output', async () => {
  await (of() as Observable<string>)
    .pipe(
      appendFile(path.join(global.testRoot, 'error.log'))
    ).toPromise()
  expect(fs.existsSync(log)).toEqual(false)
})
