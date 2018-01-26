const {
  concurrent,
  crossEnv,
  ifNotWindows,
  ifWindows,
  mkdirp,
  series,
  setColors,
} = require('nps-utils')
const pjson = require('./package.json')
const release = pjson.devDependencies.typedoc ? ['ci.release.semantic-release', 'ci.release.typedoc'] : ['ci.release.semantic-release']
const script = (script, description) => description ? {script, description} : {script}
const hidden = script => ({script, hiddenFromHelp: true})
const unixOrWindows = (unix, windows) => series(ifNotWindows(unix), ifWindows(windows))

setColors(['dim'])

let ciTests = [
  'ci.test.eslint',
  'ci.test.mocha',
  'ci.test.tslint',
]

module.exports = {
  scripts: {
    build: 'rm -rf lib && tsc',
    lint: {
      default: concurrent.nps('lint.eslint', 'lint.commitlint', 'lint.tsc', 'lint.tslint'),
      eslint: script('eslint .', 'lint js files'),
      commitlint: script('commitlint --from origin/master', 'ensure that commits are in valid conventional-changelog format'),
      tsc: script('tsc -p test --noEmit', 'syntax check with tsc'),
      tslint: script('tslint -p test', 'lint ts files'),
    },
    test: {
      default: script(concurrent.nps('lint', 'test.mocha'), 'lint and run all tests'),
      series: script(series.nps('lint', 'test.mocha'), 'lint and run all tests in series'),
      mocha: {
        default: script('mocha --forbid-only "test/**/*.test.ts"', 'run all mocha tests'),
        coverage: {
          default: hidden(series.nps('test.mocha.nyc nps test.mocha', 'test.mocha.coverage.report')),
          report: hidden(series('nps "test.mocha.nyc report --reporter text-lcov" > coverage.lcov')),
        },
        junit: hidden(series(
          crossEnv('MOCHA_FILE="reports/mocha.xml" ') + series.nps('test.mocha.nyc nps \\"test.mocha --reporter mocha-junit-reporter\\"'),
          series.nps('test.mocha.coverage.report'),
        )),
        nyc: hidden('nyc --nycrc-path node_modules/@dxcli/dev-nyc-config/.nycrc'),
      },
    },
    ci: {
      test: {
        default: hidden(series(
          mkdirp('reports'),
          unixOrWindows(
            concurrent.nps(...ciTests),
            series.nps(...ciTests),
          ),
        )),
        mocha: hidden(
          unixOrWindows(
            series.nps('test.mocha.junit'),
            series.nps('test.mocha.coverage'),
          )
        ),
        eslint: hidden(
          unixOrWindows(
            series.nps('lint.eslint --format junit --output-file reports/eslint.xml'),
            series.nps('lint.eslint'),
          )
        ),
        tslint: hidden(
          unixOrWindows(
            series.nps('lint.tslint --format junit > reports/tslint.xml'),
            series.nps('lint.tslint'),
          )
        ),
      },
      typedoc: hidden('typedoc --out /tmp/docs src/index.ts --excludeNotExported --mode file'),
      release: {
        default: hidden(series.nps(...release)),
        'semantic-release': hidden('semantic-release -e @dxcli/dev-semantic-release'),
        typedoc: hidden(series(
          'git clone -b gh-pages $CIRCLE_REPOSITORY_URL gh-pages',
          'nps ci.typedoc',
          'rm -rf ./gh-pages/*',
          'mv /tmp/docs/* ./gh-pages',
          'cd gh-pages && git add . && git commit -m "updates from $CIRCLE_SHA1 [skip ci]" && git push',
        )),
      },
    },
  },
}
