// @flow

const deps = {
  get chalk () { return require('chalk') },

  get Base () { return require('./base') },
  get StreamOutput () { return require('./stream') },
  get Errors () { return require('./errors') }
}

// cache requires
module.exports = new Proxy(deps, {
  get: (target, name) => {
    if (typeof name !== 'string') return target[name]
    const k = '_' + name
    if (!target[k]) {
      target[k] = deps[name]
    }
    return target[k]
  }
})
