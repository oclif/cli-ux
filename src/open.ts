// this code is largely taken from opn
import * as childProcess from 'child_process'
import * as path from 'path'
const isWsl = require('is-wsl')

export namespace open {
  export type Options = {
    // wait: boolean
    app?: string | string[];
  }
}

export default function open(target: string, opts: open.Options = {}) {
  // opts = {wait: true, ...opts}

  let cmd
  let appArgs: string[] = []
  let args: string[] = []
  const cpOpts: childProcess.SpawnOptions = {}

  if (Array.isArray(opts.app)) {
    appArgs = opts.app.slice(1)
    opts.app = opts.app[0]
  }

  if (process.platform === 'darwin') {
    cmd = 'open'

    // if (opts.wait) {
    //   args.push('-W')
    // }

    if (opts.app) {
      args.push('-a', opts.app)
    }
  } else if (process.platform === 'win32' || isWsl) {
    cmd = 'cmd' + (isWsl ? '.exe' : '')
    args.push('/c', 'start', '""', '/b')
    target = target.replace(/&/g, '^&')

    // if (opts.wait) {
    //   args.push('/wait')
    // }

    if (opts.app) {
      args.push(opts.app)
    }

    if (appArgs.length > 0) {
      args = args.concat(appArgs)
    }
  } else {
    if (opts.app) {
      cmd = opts.app
    } else {
      cmd = process.platform === 'android' ? 'xdg-open' : path.join(__dirname, 'xdg-open')
    }

    if (appArgs.length > 0) {
      args = args.concat(appArgs)
    }

    // if (!opts.wait) {
    // `xdg-open` will block the process unless
    // stdio is ignored and it's detached from the parent
    // even if it's unref'd
    cpOpts.stdio = 'ignore'
    cpOpts.detached = true
    // }
  }

  args.push(target)

  if (process.platform === 'darwin' && appArgs.length > 0) {
    args.push('--args')
    args = args.concat(appArgs)
  }

  const cp = childProcess.spawn(cmd, args, cpOpts)

  return new Promise((resolve, reject) => {
    cp.once('error', reject)

    cp.once('close', code => {
      if (code > 0) {
        reject(new Error('Exited with code ' + code))
        return
      }

      resolve(cp)
    })
  })
}
