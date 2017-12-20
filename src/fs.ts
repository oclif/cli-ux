export * from 'fs'
import * as fs from 'fs'
import * as path from 'path'

const o777 = parseInt('0777', 8)

export function mkdirpSync(p: string, opts: { mode?: number } = {}, made?: string): string | undefined {
  if (!opts.mode) opts.mode = o777 & ~process.umask()

  p = path.resolve(p)

  try {
    fs.mkdirSync(p, opts.mode)
    made = made || p
  } catch (err0) {
    switch (err0.code) {
      case 'ENOENT':
        if (path.dirname(p) === p) throw err0
        made = mkdirpSync(path.dirname(p), opts, made)
        mkdirpSync(p, opts, made)
        break

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
      default:
        let stat
        try {
          stat = fs.statSync(p)
        } catch (err1) {
          throw err0
        }
        if (!stat.isDirectory()) throw err0
        break
    }
  }

  return made
}
