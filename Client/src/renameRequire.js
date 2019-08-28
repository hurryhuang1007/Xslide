if (global.require) {
  global.nodeRequire = global.require
  delete global.require
  delete global.exports
  delete global.module

}