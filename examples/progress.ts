import {cli} from '../src'

function example3() {
  console.log('Example 3: bar with payload values')
  const b4 = cli.progress({
    format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | Speed: {speed}',
  })

  // initialize the bar -  defining payload token "speed" with the default value "N/A"
  b4.start(200, 0, {
    speed: 'N/A',
  })

  // the bar value - will be linear incremented
  let value = 0

  const speedData: any = []

  // 20ms update rate
  const timer = setInterval(function () {
    // increment value
    value++

    // example speed data
    speedData.push((Math.random() * 2) + 5)
    const currentSpeedData = speedData.splice(-10)

    // update the bar value
    b4.update(value, {
      speed: (currentSpeedData.reduce(function (a: any, b: any) {
        return a + b
      }, 0) / currentSpeedData.length).toFixed(2) + 'mb/s',
    })

    if (value >= b4.getTotal()) {
      // stop timer
      clearInterval(timer)

      b4.stop()
    }
  }, 20)
}

function example2() {
  console.log('Example 2: bar with custom settings')
  const b2 = cli.progress({
    barCompleteChar: '#',
    barIncompleteChar: '_',
    format: '||{bar} || {percentage}% ',
    fps: 100,
    stream: process.stdout,
    barsize: 30,
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

      example3()
    }
  }, 50)
}

function example1() {
  // create new progress bar using default values
  console.log('Example 1: bar with default values')
  const b1 = cli.progress()
  b1.start()

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
      example2()
    }
  }, 10)
}

example1() // example1 calls examples2 calls example 3...
