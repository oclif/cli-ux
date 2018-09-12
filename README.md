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

// yes/no confirmation
await cli.confirm('Continue?')

// "press any key to continue"
await cli.anykey()
```

![prompt demo](assets/prompt.gif)

# cli.url(text, uri)

Create a hyperlink (if supported in the terminal)

```typescript
await cli.url('sometext', 'https://google.com')
// shows sometext as a hyperlink in supported terminals
// shows https://google.com in unsupported terminals
```

![url demo](assets/url.gif)

# cli.open

Open a url in the browser

```typescript
await cli.open('https://oclif.io')
```

# cli.action

Shows a spinner

```typescript
// start the spinner
cli.action.start('starting a process')
// show on stdout instead of stderr
cli.action.start('starting a process', {stdout: true})

// stop the spinner
cli.action.stop() // shows 'starting a process... done'
cli.action.stop('custom message') // shows 'starting a process... custom message'
```

This degrades gracefully when not connected to a TTY. It queues up any writes to stdout/stderr so they are displayed above the spinner.

![action demo](assets/action.gif)

# cli.annotation

Shows an iterm annotation

```typescript
// start the spinner
cli.annotation('sometest', 'annotated with this text')
```

![annotation demo](assets/annotation.png)

# cli.wait

Waits for 1 second or given milliseconds

```typescript
await cli.wait()
await cli.wait(3000)
```

# cli.supertable

Displays a customizable table

```typescript
cli.supertable.display(data, columns, options)
```

Where:

- `data`: array of data object to display
- `columns`: SuperTable.Columns object (see more below)
- `options`: SuperTable.Options object (see more below)

`SuperTable.Columns` ... foo

`SuperTable.Options` ... foo

`cli.supertable.flags` is an object containing all the flags to include in your command to give users customizable tables

```typescript
{
  columns: Flags.string({exclusive: ['additional'], description: 'only show provided columns (comma-seperated)'}),
  sort: Flags.string({description: 'property to sort by (prepend \'-\' for descending)'}),
  filter: Flags.string({description: 'filter property by partial string matching, ex: name=foo'}),
  csv: Flags.boolean({exclusive: ['no-truncate'], description: 'output is csv format'}),
  additional: Flags.boolean({description: 'show additional properties'}),
  'no-truncate': Flags.boolean({exclusive: ['csv'], description: 'do not truncate output to fit screen'}),
  'no-header': Flags.boolean({exclusive: ['csv'], description: 'hide table header from output'}),
}
```

Example class:

```typescript
import {api} from 'my-api-clent'
import {cli} from 'cli-ux'
import {Command} from '@oclif/command'
import {SuperTable} from 'cli-ux/lib/styled/supertable'

export default class Users extends Command {
  static flags = {
    ...cli.supertable.flags
  }

  async run() {
    const {flags} = this.parse(User)
    const users = await api.get<any[]>('/users')

    const columns: SuperTable.Columns = {
      name: {
        minWidth: 7,
      },
      team: {
        get: row => row.owner && row.owner.email
      },
      id: {
        header: "ID",
        additional: true
      }
    }

    const options: SuperTable.Options = {
      printLine: this.log,
      ...flags, // parsed flags
    }

    ux.supertable.display(apps, columns, options)
  }
}
```

Displays:

```bash
$ example-cli users
Name   Team
Jordan Sales
Jamie  Engineering

$ example-cli users --additional
Name   Team        ID
Jordan Sales       100
Jamie  Engineering 200
```