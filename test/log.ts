import cli from '../src'

cli.config.errlog = 'tmp/foo.log'

cli.error('this should go to foo.log')
