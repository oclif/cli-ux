/* eslint-disable unicorn/filename-case */

const {
  setColors,
  concurrent,
  crossEnv,
  mkdirp,
  series,
} = require('nps-utils')

setColors(['dim'])

const script = (script, description) => description ? {script, description} : {script}

const linters = {
  eslint: script('eslint .', 'lint js files'),
  commitlint: script('commitlint --from origin/master', 'ensure that commits are in valid conventional-changelog format'),
  tsc: script('tsc -p test --noEmit', 'syntax check with tsc'),
  tslint: script('tslint -p test', 'lint ts files'),
}

let test = 'mocha --forbid-only "test/**/*.test.ts"'
if (process.env.CI) {
  if (process.env.CIRCLECI) {
    // add mocha junit reporter
    test = crossEnv(`MOCHA_FILE=reports/mocha.xml ${test} --reporter mocha-junit-reporter`)
    // add eslint reporter
    linters.eslint.script = `${linters.eslint.script} --format junit --output-file reports/eslint.xml`
    // add tslint reporter
    linters.tslint.script = `${linters.tslint.script} --format junit > reports/tslint.xml`
  }
  // add code coverage reporting with nyc
  const nyc = 'nyc --nycrc-path node_modules/@dxcli/nyc-config/.nycrc'
  const nycReport = `${nyc} report --reporter text-lcov > coverage.lcov`
  test = series(`${nyc} ${test}`, nycReport)
}

test = concurrent({
  ...linters,
  test: series('nps build', test),
})

if (process.env.CI) test = series(mkdirp('reports'), test)

module.exports = {
  scripts: {
    ...linters,
    build: series('rm -rf lib', 'tsc'),
    lint: concurrent(linters),
    test,
    release: 'semantic-release -e @dxcli/semantic-release',
  },
}
