const reactive = require('./db')
module.exports = (app , options) => {
  app.cache = reactive(options.path)
}