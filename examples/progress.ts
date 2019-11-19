import {cli} from '../src'

// run the example sequentially! otherwise both will write to stdout/stderr simultaneous !
Example1(() => {}) // to get all examples running sequentially

function Example1(onComplete: any) {
  // EXAMPLE 1 ---------------------------------------------
  // create new progress bar using default values
  let b1 = new cli.progress('SingleBar', {format: 'Example 1: Progress {bar} | {percentage}%'}).getProgressBar()
  b1.start(100, 0)

  // the bar value - will be linear incremented
  let value = 0

  // 20ms update rate
  const timer = setInterval(function () {
    // increment value
    value++

    // update the bar value
    b1.update(value)

    // set limit
    if (value >= b1.getTotal()) {
      // stop timer
      clearInterval(timer)

      b1.stop()
      // run complete callback
      //@ts-ignore
      Example2(this)
    }
  }, 10)
}

function Example2(onComplete: any) {
  // EXAMPLE 2 ---------------------------------------------
  //console.log('\nExample 2 - Custom configuration')

  // create new progress bar using default values
  const b2 = new cli.progress('SingleBar', {
    barCompleteChar: '#',
    barIncompleteChar: '_',
    format: 'Example 2: Current Upload Progress: {percentage}%' + ' - ' + '||{bar}||',
    fps: 5,
    stream: process.stdout,
    barsize: 30
  })
  b2.getProgressBar().start(100, 0)

  // 50ms update rate
  const timer = setInterval(function () {
    // increment value
    b2.getProgressBar().increment()

    // set limit
    if (b2.getProgressBar().value >= b2.getProgressBar().getTotal()) {
      // stop timer
      clearInterval(timer)

      b2.getProgressBar().stop()

      // run complete callback
      // @ts-ignore
      Example3(this)
    }
  }, 50)
}

function Example3(onComplete: any) {
  // EXAMPLE 5 ---------------------------------------------
  //console.log('\nExample 5 - Custom Payload')
  // create new progress bar
  const b4 = new cli.progress('SingleBar', {
    format: 'Example 4: progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | Speed: {speed}'
  })

  // initialize the bar -  defining payload token "speed" with the default value "N/A"
  b4.getProgressBar().start(200, 0, {
    speed: 'N/A'
  })

  // the bar value - will be linear incremented
  let value = 0

  const speedData: any = []

  // 20ms update rate
  let timer = setInterval(function () {
    // increment value
    value++

    // example speed data
    speedData.push(Math.random() * 2 + 5)
    const currentSpeedData = speedData.splice(-10)

    // update the bar value
    b4.getProgressBar().update(value, {
      speed: (currentSpeedData.reduce(function (a: any, b: any) { return a + b }, 0) / currentSpeedData.length).toFixed(2) + 'mb/s'
    })

    // set limit
    if (value >= b4.getProgressBar().getTotal()) {
      // stop timer
      clearInterval(timer)

      b4.getProgressBar().stop()

      // run complete callback
      //@ts-ignore
      Example4(this)
    }
  }, 20)
}

function Example4(onComplete: any) {
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
  // tslint:disable-next-line:forin no-for-in
  for (const filename in files) {
    // @ts-ignore
    const size = files[filename]
    bars.push(multibar.create(size, 0, {file: filename}))
  }

  const timer = setInterval(() => {
    // increment
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i]

      // download complete ?
      if (bar.value < bar.total) {
        bar.increment()
      }
    }

    // progress bar running ?
    // check "isActive" property in case you've enabled "stopOnComplete" !
    if (multibar.isActive === false) {
      clearInterval(timer)
      multibar.stop()
    }
  }, 3)
}
