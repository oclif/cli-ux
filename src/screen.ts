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

const columns: number | null = (global as any)['columns']

let stdtermwidth = termwidth(process.stdout)
let errtermwidth = termwidth(process.stderr)

process.stdout.on('resize', () => {
  stdtermwidth = termwidth(process.stdout)
})
process.stderr.on('resize', () => {
  errtermwidth = termwidth(process.stderr)
})

export default {
  get errtermwidth(): number {
    return columns || errtermwidth
  },
  get stdtermwidth(): number {
    return columns || stdtermwidth
  },
}
