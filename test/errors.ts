import cli from '../src'

cli.warn('this is a warning')

cli.subscribe(m => {
  if (m.level === 'warn') {
    console.dir(m)
  }
})

cli.warn('is emitted')

cli.error('this is an error')
