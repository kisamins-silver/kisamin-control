// /////////////////////////////////////////////////////
//              Module Initializations                //
//                                                    //
// Initalize all nodejs modules needed in the project //
// /////////////////////////////////////////////////////

  process.on(`uncaughtException`, console.error)
  // master config file
  var config = require('./config')

  // filesystem access
  var fs = require('fs')
  var path = require('path')

  // node express & web base
  var express = require('express')
  var app = express()

  var graphqlHTTP = require('express-graphql')

  var graphSchema = require('./inhouse_modules/graphqlSchema')
  var reportingSchema = graphSchema.schema

  var http = require('http')
  var httpServer = http.Server(app)

  // data endpoint
  app.use('/api', graphqlHTTP({
    schema: reportingSchema,
    graphiql: true
  }))

  app.use('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html')
  })

// startup server
  httpServer.listen(80, config.startFn(80))
