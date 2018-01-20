const {concurrent, series} = require('nps-utils')

module.exports = {
  scripts: {
    build: 'rm -rf lib && tsc',
    lint: {
      default: concurrent.nps('lint.eslint', 'lint.commitlint', 'lint.tsc', 'lint.tslint'),
      eslint: {
        script: 'eslint .',
        description: 'lint js files',
      },
      commitlint: {
        script: 'commitlint --from origin/master',
        description: 'ensure that commits are in valid conventional-changelog format',
      },
      tsc: {
        script: 'tsc -p test --noEmit',
        description: 'syntax check with tsc',
      },
      tslint: {
        script: 'tslint -p test',
        description: 'lint ts files',
      },
    },
    test: {
      default: {
        script: concurrent.nps('lint', 'test.mocha'),
        description: 'lint and run all tests',
      },
      mocha: {
        script: 'mocha "test/**/*.test.ts"',
        description: 'run all mocha tests',
      },
    },
    ci: {
      default: {
        script: concurrent.nps(
          'ci.mocha',
          'ci.eslint',
          'ci.tslint',
        ),
        hiddenFromHelp: true,
      },
      mocha: {
        default: {
          script: series.nps('ci.mocha.test', 'ci.mocha.report'),
          hiddenFromHelp: true,
        },
        test: {
          script: 'MOCHA_FILE="reports/mocha.xml" nps "ci.mocha.nyc nps \\"test.mocha --reporter mocha-junit-reporter\\""',
          hiddenFromHelp: true,
        },
        report: {
          script: series.nps('ci.mocha.nyc report --reporter text-lcov > coverage.lcov'),
          hiddenFromHelp: true,
        },
        nyc: {
          script: 'nyc --nycrc-path node_modules/@dxcli/dev-nyc-config/.nycrc',
          hiddenFromHelp: true,
        },
      },
      eslint: {
        script: series.nps('lint.eslint --format junit --output-file reports/eslint.xml'),
        hiddenFromHelp: true,
      },
      tslint: {
        script: series.nps('lint.tslint --format junit > reports/tslint.xml'),
        hiddenFromHelp: true,
      },
      release: {
        script: 'dxcli-dev-semantic-release',
        hiddenFromHelp: true,
      },
    },
  },
}
