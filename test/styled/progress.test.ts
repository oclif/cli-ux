import {expect, fancy} from 'fancy-test'

// import {BarType, Progress} from '../../src/progress'
import cli from '../../src'

describe('progress', () => {
  // single bar
  fancy
    .end('single bar', _ => {
      let b1 = new cli.progress('SingleBar', {format: 'Example 1: Progress {bar} | {percentage}%'})
      expect(b1.getProgressBar().options.format).to.contain('Example 1: Progress')
      expect(b1.getProgressBar().bars).to.not.have
    })

  // multi-bar
  fancy
    .end('has multibar', _ => {
      const files = {
        'eta.js        ': 187,
        'generic-bar.js': 589,
        'multi-bar.js  ': 1897,
        'options.js    ': 42,
        'single-bar.js ': 2123,
        'terminal.js   ': 500
      }
      const bars: any = []
      // create new container
      const multibar = new cli.progress('MultiBar', {
        format: 'Example 5: {bar} | "{file}" | {value}/{total}',
        hideCursor: true,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        stopOnComplete: true
      }).getProgressBar()
      // add bars
      let filesLength = 0
      // tslint:disable-next-line:forin no-for-in
      for (const filename in files) {
        // @ts-ignore
        const size = files[filename]
        bars.push(multibar.create(size, 0, {file: filename}))
        filesLength++
      }
      expect(multibar.options.format).to.contain('Example 5: ')
      expect(filesLength).length.to.equal(6)
    })
  // testing no settings passed, default settings created
  fancy
    .end('single bar', _ => {
      let b1 = new cli.progress('SingleBar', {}).getProgressBar()
      expect(b1.options.format).to.contain('progress')
      expect(b1.bars).to.not.have
    })
  //testing getProgressBar returns correct type
  fancy
    .end('typeof getProgressBar', _ => {
      let b1 = new cli.progress('SingleBar', {format: 'Example 1: Progress {bar} | {percentage}%'})
      expect(typeof(b1.getProgressBar())).to.equal('object')
    })
})
