var env = {}

env.dev = {
  httpPort: 3000,
  httpsPort: 3001,
  name: 'development'
}

env.production = {
  httpPort: 4000,
  httpsPort: 4001,
  name: 'production'
}

// Check the execution environment
var execEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

var config = typeof (env[execEnv]) == 'object' ? env[execEnv] : env.dev

module.exports = config