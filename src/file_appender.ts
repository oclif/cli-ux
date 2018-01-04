import * as fs from 'fs-extra'
import * as path from 'path'
import {Observable} from 'rxjs/observable'
import {bufferTime, last, map} from 'rxjs/operators'

export default (file: string) => (source: Observable<string>) => {
  let stream: Promise<fs.WriteStream> | undefined
  function getStream () {
    return stream = stream || (async () => {
      await fs.mkdirp(path.dirname(file))
      return await fs.createWriteStream(file, {flags: 'a+', encoding: 'utf8'})
    })()
  }

  async function write (lines: string[]) {
    if (lines.length) {
      const stream = await getStream()
      await stream.write(lines.join('\n') + '\n')
    }
  }

  async function close () {
    if (!stream) return
    const s = await stream
    return new Promise((resolve, reject) => {
      s.end((err: Error) => err ? reject(err) : resolve())
      stream = undefined
    })
  }

  return source
    .pipe(
      bufferTime(5),
      map(lines => write(lines)),
      last(),
      map(() => close())
    )
}
