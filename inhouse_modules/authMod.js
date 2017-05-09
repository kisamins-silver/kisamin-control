  var config = require('../config')
  var sql = require('seriate')
  sql.addConnection(config.db)
  var admain = require('activedirectory')
  var ad = admain(config.ad)
  var jwt = require('jsonwebtoken')
  var _ = require('lodash') // data manipulations

  // authorize against active directory
  function adAuth (login, password, callback) {
    ad.authenticate(login + config.domain, password, function (err, auth) {
      var a = {error: err}
      a.token = err ? null : jwt.sign({login: login, password: password}, config.secret, {
        expiresIn: config.tokenTimeout
      })
      a.msg = a.error ? 'Authentication Failed' : 'Authenticated'
      a.route = a.error ? null : 'inhouse'
      callback(a)
    })
  }

  // authorize against web access clients
  function webAuth (login, password, callback) { // need to combine the two queries into one
    sql.execute('SMv9', {query: config.webUserSQL, params: {login: login, password: password}}).then(
      function (results) {
        if (results.length) {
              // insert/update last access in db (do this on query check instead?) then proceed below
          var a = {error: null, msg: 'Authenticated'}
          a.token = jwt.sign({login: login, password: password, id: results[0].AccountID, type: 'webClient', web: true}, config.secret, {
            expiresIn: config.tokenTimeout
          })
          callback(a)
        } else {
          callback({error: {msg: 'No matching web login found'}, token: null, msg: 'Authentication Failed', route: null})
        }
      },
      // line disable because lint erroring on nonuse of 'error' variable, but error is not desired to be passed to lower functions by callback and function is only called when error is present.
      function (error) { // eslint-disable-line
        callback({error: {msg: 'SQL Error 301'}, token: null, msg: 'Authentication Failed', route: null})
      }
    )
  }

  // validate web token
  function tokenAuth (token, callback) {
    jwt.verify(token, config.secret, function (err, decoded) {
      callback(err, decoded)
    })
  }

  // validate login attemtp !!!!needs error handling!!!!
  function loginAuth (login, password, callback) {
    webAuth(login, password, function (auth) {
      if (auth.error) {
        adAuth(login, password, function (aduser) {
          callback(aduser)
        })
      } else {
        callback(auth)
      }
    })
  }

  function getAuthedClients (user, callback) {
    if (!user.web) {
      // return all
      sql.execute('SMv9', {
        query: 'Select Distinct CustomerID From dbo.CLIrpProjectList',
        params: {}
      }).then(
          function (results) {
            callback(null, _.map(results, 'CustomerID'))
          },
          function (error) {
            callback(error, null)
          }
        )
    } else {
      // query clients
      sql.execute('SMv9', {
        query: "Select Distinct CustomerID From dbo.CLIrpProjectList WHERE Username = @login AND Password = HASHBYTES('SHA1', CONVERT(nvarchar(4000),@password))",
        params: {
          login: user.login,
          password: user.password
        }
      }).then(
          function (results) {
            callback(null, _.map(results, 'CustomerID'))
          },
          function (error) {
            callback(error, null)
          }
        )
    }
  }

  function getAuthedPlants (user, callback) {
    if (!user.web) {
      // return all
      sql.execute('SMv9', {
        query: 'Select Distinct CASE ProjectName WHEN NULL THEN SingleProjectName ELSE ProjectName END AS Plant From dbo.CLIrpProjectList',
        params: {}
      }).then(
          function (results) {
            callback(null, _.map(results, 'Plant'))
          },
          function (error) {
            callback(error, null)
          }
        )
    } else {
      // query plants
      sql.execute('SMv9', {
        query: "Select Distinct Plant From dbo.CLIrpProjectList WHERE Username = @login AND Password = HASHBYTES('SHA1', CONVERT(nvarchar(4000),@password))",
        params: {
          login: user.login,
          password: user.password
        }
      }).then(
          function (results) {
            callback(null, _.map(results, 'Plant'))
          },
          function (error) {
            callback(error, null)
          }
        )
    }
  }

  // supplied tokens will always have login and password on root of token for later use as auths. additionally web client will have web set to true as a test to know which (inhouse/web) to auth against in subsequent calls

  module.exports = {'loginAuth': loginAuth, 'tokenAuth': tokenAuth, 'getAuthedPlants': getAuthedPlants, 'getAuthedClients': getAuthedClients}
