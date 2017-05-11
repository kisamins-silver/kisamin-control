process.on(`uncaughtException`, console.error)
var config = require('./config')
var fs = require('fs')
var path = require('path')
var express = require('express')
var app = express()
var graphqlHTTP = require('express-graphql')
var graphSchema = require('./inhouse_modules/graphqlSchema')
var reportingSchema = graphSchema.schema
var http = require('http')
var httpServer = http.Server(app)
app.use('/api', graphqlHTTP({
	schema: reportingSchema,
	graphiql: true
}))
app.use('/', function (req, res, next) {
	res.sendFile(__dirname + '/index.html')
})
httpServer.listen(8080, config.startFn(8080))