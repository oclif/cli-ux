export default (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
