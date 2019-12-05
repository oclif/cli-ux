import {cli} from '../src'

async function delay(ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

  // 20ms update rate
  const timer = await setInterval(function () {
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
    }
  }, 20)
}

async function customSettingExample() {
  console.log('Example 2: bar with custom settings')
  const bar = cli.progress({
    barCompleteChar: '#',
    barIncompleteChar: '_',
    format: '||{bar} || {percentage}% ',
    fps: 100,
    stream: process.stdout,
    barsize: 30,
  })
  bar.start(100, 0)

  // 50ms update rate
  const timer = await setInterval(() => {
    // increment value
    bar.increment()

    // set limit
    if (bar.value >= bar.getTotal()) {
      clearInterval(timer)

      bar.stop()
    }
  }, 50)
}

async function defaultSettingExample() {
  // create new progress bar using default values
  console.log('Example 1: bar with default values')
  const bar = cli.progress()
  bar.start()

  // the bar value
  let value = 0

  // 20ms update rate
  const timer = setInterval(() => {
    value++

    // update the bar value
    bar.update(value)
    if (value >= bar.getTotal()) {
      // stop timer
      clearInterval(timer)

      bar.stop()
    }
  }, 10)
}

const main = async () => {
  await defaultSettingExample()
  await delay(1200)
  await customSettingExample()
  await delay(5100)
  await payloadValueExample()
}
main()

