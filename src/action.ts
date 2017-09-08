export default async function action(msg: string, fn = () => {}, done = "done") {
      process.stderr.write(`${msg}...`);

  try {
    await fn()
    process.stderr.write(` ${done}\n`)
  } catch (err) {
    process.stderr.write(" !\n")
    console.error(err.stack)
    process.exit(1)
  }
}
