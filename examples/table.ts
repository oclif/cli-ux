import {Command} from '@oclif/command'
import axios from 'axios'

import {cli} from '../src'

export default class Users extends Command {
  static flags = {
    ...cli.table.flags()
  }

  async run() {
    const {flags} = this.parse(Users)
    const {data: users} = await axios.get('https://jsonplaceholder.typicode.com/users')

    cli.table(users,
      {
        name: {
          minWidth: 7,
        },
        company: {
          get: (row: any) => row.company && row.company.name
        },
        id: {
          header: 'ID',
          extended: true,
        }
      },
      {
        printLine: this.log,
        ...flags, // parsed flags
      }
    )
  }
}

Users.run().then(null, err => cli.error(err))
