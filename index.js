var https = require('https')
var http = require('http')
var fs = require('fs')
var url = require('url')
var StringDecoder = require('string_decoder').StringDecoder
var config = require('./config')

// Credentials for https connection
var httpsServerOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
}

// Route handle
var routeHandlers = {}
routeHandlers.ping = function (data, callback) {
  callback(200)
}

routeHandlers.greet = function (data, callback) {
 callback(200, {message: 'Welcome to Nodejs Masterclass by pirple, am liking it. You just made a '+ data.reqMethod.toUpperCase() + ' request to ' + data.reqHeaders.host + '/' + data.trimPathName})
}

routeHandlers.notFound = function (data, callback) {
  callback(404)
}

var appRouter = {
  ping: routeHandlers.ping,
  hello: routeHandlers.greet
}

// HTTPS server
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  handleResponse(req, res)
})

// HTTP server
var httpServer = http.createServer(function (req, res) {
  handleResponse(req, res)
})


httpsServer.listen(config.httpsPort, function () {
  console.log('HTTPS listener is on port ' + config.httpsPort)
})

httpServer.listen(config.httpPort, function () {
  console.log('HTTP listener is on port ' + config.httpPort)
})

var handleResponse = function (req, res) {
  var parseUrl = url.parse(req.url, true)
  var pathName = parseUrl.pathname
  var trimPathName = pathName.replace(/^\/+|\/+$/g, '')

  var queryString = parseUrl.query
  var reqMethod = req.method.toLowerCase()
  var reqHeaders = req.headers

  var decoder = new StringDecoder('utf-8')
  var buffer = ''

  req.on('data', function (data) {
    buffer += decoder.write(data)
  })

  req.on('end', function () {
    buffer += decoder.end()

    // Determine request handle
    var routeRequest = typeof (appRouter[trimPathName]) !== 'undefined' ? appRouter[trimPathName] : routeHandlers.notFound

    // Construct handler params/data
    var dataParams = {
      trimPathName: trimPathName,
      queryString: queryString,
      reqMethod: reqMethod,
      reqHeaders: reqHeaders,
      payload: buffer
    }

    // Routes request to handlers
    routeRequest(dataParams, function (statusCode, payload) {
      statusCode = typeof statusCode === 'number' ? statusCode : 200

      payload = typeof payload === 'object' ? payload : {}

      // Converts payload to JSON
      var payloadJSON = JSON.stringify(payload)

      // set response header
      res.setHeader('content-type', 'application/json')
      res.writeHead(200)

      // Sends response
      res.end(payloadJSON)

      // Logs path, statuscode and payload
      // Formatted console output - looks more like a logger :)
      console.log('Path /%s Status: %d', trimPathName, statusCode)
    })
  })
}