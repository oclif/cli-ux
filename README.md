cli-ux
======

cli IO utilities

[![Version](https://img.shields.io/npm/v/cli-ux.svg)](https://npmjs.org/package/cli-ux)
[![CircleCI](https://circleci.com/gh/oclif/cli-ux/tree/master.svg?style=svg)](https://circleci.com/gh/oclif/cli-ux/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/oclif/cli-ux?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/cli-ux/branch/master)
[![Codecov](https://codecov.io/gh/oclif/cli-ux/branch/master/graph/badge.svg)](https://codecov.io/gh/oclif/cli-ux)
[![Greenkeeper](https://badges.greenkeeper.io/oclif/cli-ux.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/npm/cli-ux/badge.svg)](https://snyk.io/test/npm/cli-ux)
[![Downloads/week](https://img.shields.io/npm/dw/cli-ux.svg)](https://npmjs.org/package/cli-ux)
[![License](https://img.shields.io/npm/l/cli-ux.svg)](https://github.com/oclif/cli-ux/blob/master/package.json)

# Usage

The following assumes you have installed `cli-ux` to your project with `npm install cli-ux` or `yarn add cli-ux` and have it required in your script (TypeScript example):

```typescript
import cli from 'cli-ux'
cli.prompt('What is your name?')
```

# cli.prompt()

Prompt for user input.

```typescript
// just prompt for input
await cli.prompt('What is your name?')

// mask input after enter is pressed
await cli.prompt('What is your two-factor token?', {type: 'mask'})

// mask input on keypress (before enter is pressed)
await cli.prompt('What is your password?', {type: 'hide'})
```

![prompt demo](assets/prompt.gif)
