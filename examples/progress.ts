import {cli} from '../src'

async function payloadValueExample() {
  console.log('Example 3: bar with payload values')
  const bar = cli.progress({
    format: '[{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | Speed: {speed}',
  })

  // initialize the bar -  defining payload token "speed" with the default value "N/A"
  bar.start(200, 0, {
    speed: 'N/A',
  })
  // the bar value - will be linear incremented
  let value = 0
  const speedData: any = []
  return new Promise((resolve => {
    const timer = setInterval(function () {
      // increment value
      value++

      // example speed data
      speedData.push((Math.random() * 2) + 5)
      const currentSpeedData = speedData.splice(-10)

      // update the bar value
      bar.update(value, {
        speed: (currentSpeedData.reduce((a: any, b: any) => {
          return a + b
        }, 0) / currentSpeedData.length).toFixed(2) + 'mb/s',
      })

      if (value >= bar.getTotal()) {
        // stop timer
        clearInterval(timer)

        bar.stop()
        resolve()
      }
    }, 20)
  }))
}

async function customSettingExample() {
  console.log('Example 2: bar with custom settings')
  const bar = cli.progress({
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    format: '||{bar} || {percentage}% ',
    fps: 100,
    stream: process.stdout,
    barsize: 30,
  })
  bar.start(100, 0)
  let value = 0
  return new Promise((resolve => {
    const timer = setInterval(() => {
      value++

      // update the bar value
      bar.update(value)
      if (value >= bar.getTotal()) {
        // stop timer
        clearInterval(timer)

        bar.stop()
        resolve()
      }
    }, 50)
  }))
}

async function defaultSettingExample() {
  // create new progress bar using default values
  console.log('Example 1: bar with default values')
  return new Promise((resolve => {
    const bar = cli.progress()
    bar.start()
    let value = 0
    const timer = setInterval(() => {
      value++

      // update the bar value
      bar.update(value)
      if (value >= bar.getTotal()) {
        // stop timer
        clearInterval(timer)

        bar.stop()
        resolve()
      }
    }, 20)
  }))
}

const main = async () => {
  await defaultSettingExample()
  await customSettingExample()
  await payloadValueExample()
}

main()

