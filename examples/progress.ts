import {cli} from '../src'

// run the example sequentially! otherwise both will write to stdout/stderr simultaneous !
Example1()

function Example1() {
  // create new progress bar using default values
  let b1 = cli.progress('SingleBar', {format: 'Example 1: Progress {bar} | {percentage}%'})
  b1.start(100, 0)

  // the bar value
  let value = 0

  // 20ms update rate
  const timer = setInterval(function () {
    value++

    // update the bar value
    b1.update(value)
    if (value >= b1.getTotal()) {
      // stop timer
      clearInterval(timer)

      b1.stop()
      // run complete callback
      Example2()
    }
  }, 10)
}

function Example2() {
  const b2 = cli.progress('SingleBar', {
    barCompleteChar: '#',
    barIncompleteChar: '_',
    format: 'Example 2: Progress: {percentage}%' + ' - ' + '||{bar}||',
    fps: 5,
    stream: process.stdout,
    barsize: 30
  })
  b2.start(100, 0)

  // 50ms update rate
  const timer = setInterval(function () {
    // increment value
    b2.increment()

    // set limit
    if (b2.value >= b2.getTotal()) {
      clearInterval(timer)

      b2.stop()

      Example3()
    }
  }, 50)
}

function Example3() {
  const b4 = cli.progress('SingleBar', {
    format: 'Example 3: progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | Speed: {speed}'
  })

  // initialize the bar -  defining payload token "speed" with the default value "N/A"
  b4.start(200, 0, {
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
    b4.update(value, {
      speed: (currentSpeedData.reduce(function (a: any, b: any) { return a + b }, 0) / currentSpeedData.length).toFixed(2) + 'mb/s'
    })

    if (value >= b4.getTotal()) {
      // stop timer
      clearInterval(timer)

      b4.stop()

      Example4()
    }
  }, 20)
}

function Example4() {
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
  const multibar = cli.progress('MultiBar', {
    format: 'Example 4: {bar} | "{file}" | {value}/{total}',
    hideCursor: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    stopOnComplete: true
  })
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

    if (multibar.isActive === false) {
      clearInterval(timer)
      multibar.stop()
    }
  }, 3)
}
