// tslint:disable restrict-plus-operands

import {bold, dim} from 'picocolors'

export default function styledHeader(header: string) {
  process.stdout.write(dim('=== ') + bold(header) + '\n')
}
