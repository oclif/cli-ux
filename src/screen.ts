// @flow

function termwidth(stream: any): number {
  if (!stream.isTTY) {
    return 80
  }
  const width = stream.getWindowSize()[0]
  if (width < 1) {
    return 80
  }
  if (width < 40) {
    return 40
  }
  return width
}

// tslint:disable-next-line
const columns: number | null = (global as any)['columns']

module.exports = {
  errtermwidth: columns || termwidth(process.stderr),
  stdtermwidth: columns || termwidth(process.stdout),
}
