import cli from '../src'

cli.warn('this is a warning')

cli.on('warn', err => {
  console.dir(err)
})

cli.warn('is emitted')

cli.error('this is an error')
