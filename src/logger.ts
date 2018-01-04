import {Observable} from 'rxjs/observable'
import {filter, map} from 'rxjs/operators'

import deps from './deps'
import appendFile from './file_appender'
import {Level, levelGte, LineMessage, Message} from './message'

const timestamp = () => `[${deps.moment().format()}]`

function isLineMessage (level: Level) {
  // tslint:disable-next-line
  return function (m: Message): m is LineMessage {
    return m.type === 'line' && levelGte(m.level, level)
  }
}

export default (file: string, level: Level) => (source: Observable<Message>) => {
  return source.pipe(
    filter<Message, LineMessage>(isLineMessage(level)),
    map(m => [timestamp(), m.level, m.content].join(' ')),
    appendFile(file),
  )
}
