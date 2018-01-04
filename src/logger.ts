import {Observable} from 'rxjs/observable'
import {filter, map} from 'rxjs/operators'

import deps from './deps'
import appendFile from './file_appender'
import Message, {Level} from './message'

const timestamp = (msg: string) => `[${deps.moment().format()}] ${msg}`

export default (file: string, level: Level) => (source: Observable<Message>) => {
  return source.pipe(
    filter(m => m.level >= level),
    map(m => timestamp(m.content)),
    appendFile(file),
  )
}
