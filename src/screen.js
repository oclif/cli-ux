// @flow

function termwidth (stream: any): number {
  if (!stream.isTTY) return 80
  const width = stream.getWindowSize()[0]
  if (width < 1) return 80
  if (width < 40) return 40
  return width
}

module.exports = {
  stdtermwidth: global.columns || termwidth(process.stdout),
  errtermwidth: global.columns || termwidth(process.stderr)
}
