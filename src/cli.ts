import {Observable} from 'rxjs/observable'
import {Subject} from 'rxjs/Subject'

export interface IComponent {
  done(): Promise<void>
}

export class CLI extends Subject<Message> {
  components: IComponent[] = []

  trace (message: string) {
    this.next({content: message, level: 'trace'})
  }

  debug (message: string) {
    this.next({content: message, level: 'debug'})
  }

  info (message: string) {
    this.next({content: message, level: 'info'})
  }

  warn (message: string) {
    this.next({content: message, level: 'warn'})
  }

  error (message: string) {
    this.next({content: message, level: 'error'})
  }

  async done () {
    await Promise.all(this.components.map(d => d.done && d.done()))
    this.complete()
  }
}

class Output {
  constructor (observable: Observable<Message>) {
    observable.subscribe(this)
  }

  next (message: Message) {
    console.dir(message)
  }

  error (err: Error) {
    console.log(`got an error! ${err}`)
  }

  async done () {}
}

cli.components.push(new Output(cli))

export default cli
