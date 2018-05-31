// tslint:disable no-string-based-set-timeout
export default (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
