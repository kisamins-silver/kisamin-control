process.on(`uncaughtException`, console.error)
const config = require('./config')
const port = process.env.OPENSHIFT_NODEJS_PORT || config.port
const ip_address = process.env.OPENSHIFT_NODEJS_IP || config.ip
const molested = process.env.OPENSHIFT_DATA_DIR || __dirname
const fs = require('fs')
const path = require('path')
const express = require('express')
var app = express()
const graphqlHTTP = require('express-graphql')
const graphSchema = require('./inhouse_modules/graphqlSchema')
const reportingSchema = graphSchema.schema
const http = require('http')
const httpServer = http.Server(app)
app.use('/api', graphqlHTTP({
	schema: reportingSchema,
	graphiql: true
}))
app.use('/', function (req, res, next) {
	res.sendFile(__dirname + 'website/index.html')
})
console.log(port)
httpServer.listen(port, config.startFn(port))