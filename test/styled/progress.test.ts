import {expect, fancy} from 'fancy-test'

// import {BarType, Progress} from '../../src/progress'
import cli from '../../src'

describe('progress', () => {
  fancy
  .end('instantiation with the wrong progress bar type', _ => {
    expect(() => {
      cli.progress('notSingleBar', {})
    }).to.throw('notSingleBar')
  })

  // single bar
  fancy
  .end('single bar has default settings', _ => {
    const b1 = cli.progress('SingleBar', {format: 'Example 1: Progress {bar} | {percentage}%'})
    expect(b1.options.format).to.contain('Example 1: Progress')
    expect(b1.bars).to.not.have
  })

  // multi-bar
  fancy
  .end('has multibar bars array', _ => {
    const files = {
      'eta.js        ': 187,
      'generic-bar.js': 589,
      'multi-bar.js  ': 1897,
      'options.js    ': 42,
      'single-bar.js ': 2123,
      'terminal.js   ': 500,
    }
    const bars: any = []
    // create new container
    const multibar = cli.progress('MultiBar', {
      format: 'Example 5: {bar} | "{file}" | {value}/{total}',
      hideCursor: true,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      stopOnComplete: true,
    })
    // add bars
    Object.entries(files).forEach(entry => {
      bars.push(multibar.create(entry[1], 0, {file: entry[0]}))
    })

    // for (const filename in files) {
    //   const size = Object.k
    //   bars.push(multibar.create(size, 0, {file: filename}))
    // }
    expect(multibar.options.format).to.contain('Example 5: ')
    expect(Object.keys(files).length).length.to.equal(6)
  })
  // testing no settings passed, default settings created
  fancy
  .end('single bar, no bars array', _ => {
    const b1 = cli.progress('SingleBar', {})
    expect(b1.options.format).to.contain('progress')
    expect(b1.bars).to.not.have
  })
  // testing getProgressBar returns correct type
  fancy
  .end('typeof progress bar is object', _ => {
    const b1 = cli.progress('SingleBar', {format: 'Example 1: Progress {bar} | {percentage}%'})
    expect(typeof (b1)).to.equal('object')
  })
})
