// tslint:disable restrict-plus-operands

import {bold, dim} from 'colorette'

export default function styledHeader(header: string) {
  process.stdout.write(dim('=== ') + bold(header) + '\n')
}
