import * as path from 'path'

import inc from './count'

process.setMaxListeners(0)

beforeEach(async () => {
  global.columns = 80
  global.testCount = await inc()
  global.testRoot = path.join(__dirname, `../../tmp/test/test-${global.testCount}`)
})
