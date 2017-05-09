  var config = require('../config')
  var fs = require('fs')
  
  var sql = {}

  var _ = require('lodash')

  var graphqlReq = require('graphql')
  var GraphQLID = graphqlReq.GraphQLID
  var GraphQLSchema = graphqlReq.GraphQLSchema
  var GraphQLObjectType = graphqlReq.GraphQLObjectType
  var GraphQLString = graphqlReq.GraphQLString
  var GraphQLList = graphqlReq.GraphQLList
  var GraphQLInt = graphqlReq.GraphQLInt
  var GraphQLBoolean = graphqlReq.GraphQLBoolean
  var GraphQLNonNull = graphqlReq.GraphQLNonNull

// graphql schemas
  function masterSchemaQueryConstructor (arg) {
    return 1
  }

  const analysis_result = new GraphQLObjectType({
    name: 'api_result',
    description: 'Result data for each test within a single sample.',
    fields: function () {
      return {
        value: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return parent.Result
          }
        },
        units: { type: GraphQLString,
          resolve (parent, args, request) {
            return parent.Units
          }
        }
      }
    }
  })

  const test = new GraphQLObjectType({
    name: 'api_test',
    description: 'Individual data for each test within a sample bottle.',
    fields: function () {
      return {
        name: {
          type: GraphQLString,
          resolve (parent, args, request) { return parent.Param }
        },
        matrix: {
          type: GraphQLString,
          resolve (parent, args, request) { return parent.Matrix }
        },
        method: {
          type: GraphQLString,
          resolve (parent, args, request) { return parent.Method }
        },
        result: {
          type: analysis_result,
          resolve (parent, args, request) {
            return parent
          }
        },
        entered_date: {
          type: GraphQLString,
          resolve (parent, args, request) { return parent.EnteredDate }
        },
        validated_date: {
          type: GraphQLString,
          resolve (parent, args, request) { return parent.ValidatedDate }
        },
        approved_date: {
          type: GraphQLString,
          resolve (parent, args, request) { return parent.ApprovedDate }
        },
        entered_by: {
          type: GraphQLString,
          resolve (parent, args, request) { return parent.EnteredBy }
        },
        validated_by: {
          type: GraphQLString,
          resolve (parent, args, request) { return parent.ValidatedBy }
        },
        approved_by: {
          type: GraphQLString,
          resolve (parent, args, request) { return parent.ApprovedBy }
        }
      }
    }
  })

  const bottle = new GraphQLObjectType({
    name: 'api_sample',
    description: 'Individual data for each unique sample bottle.',
    fields: function () {
      return {
        id: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return parent.SampleNumber
          }
        },
        matrix: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return parent.Matrix
          }
        },
        collection_point: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return masterSchemaQueryConstructor({
              select: ['Site'],
              from: 'SMSU.OrderDetails',
              params: { 'SampleNumber': { param: 'sid', value: parent.SampleNumber } },
              top: 1
            }).then(function (result) { return result.Site.split(' - ')[0] })
          }
        },
        flow: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return parent.OrderDetails_User3
          }
        },
        collector: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return parent.Collector
          }
        },
        collect_date: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return parent.CollectDate
          }
        },
        collect_time: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return parent.CollectTime
          }
        },
        receive_date: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return parent.ReceiveDate
          }
        },
        tests: {
          type: new GraphQLList(test),
          args: { name: { type: GraphQLString } },
          resolve (parent, args, request) {
            var p = {}
            p['SampleDetails.SampleNumber'] = {param: 'sid', value: parent.SampleNumber}
            if (args.name) p['Results.Param'] = {param: 'tid', value: args.name}
            return masterSchemaQueryConstructor({
              select: ['Results.Param', 'SampleDetails.Matrix', 'Results.Method', 'Results.Result', 'Results.Units', 'Results.EnteredDate', 'Results.EnteredBy', 'Results.ValidatedDate', 'Results.ValidatedBy', 'Results.ApprovedDate', 'Results.ApprovedBy'],
              from: 'SMSU.SampleDetails INNER JOIN SMSU.Results ON SMSU.SampleDetails.SampleNumber = SMSU.Results.SampleNumber AND SMSU.SampleDetails.Test = SMSU.Results.Test',
              params: p,
              top: 2,
              distinct: true
            })
          }
        }
      }
    }
  })

  const order = new GraphQLObjectType({
    name: 'api_order',
    description: 'Individual data for each unique order ID.',
    fields: function () {
      return {
        id: {
          type: GraphQLInt,
          resolve (parent, args, request) {
            return parent.OrderID
          }
        },
        client: {
          type: client,
          resolve (parent, args, request) {
            return masterSchemaQueryConstructor({
              select: ['*'],
              from: 'SMSU.Orders',
              params: { 'OrderID': { param: 'oid', value: parent.OrderID } },
              top: 1
            })
          }
        },
        sample_location: {
          type: sample_location,
          resolve (parent, args, request) {
            return masterSchemaQueryConstructor({
              select: ['ProjectDefs.CustomerID', 'ProjectDefs.ProjectName'],
              from: 'SMSU.ProjectDefs INNER JOIN SMSU.Orders ON SMSU.ProjectDefs.CustomerID = SMSU.Orders.CustomerID AND SMSU.ProjectDefs.ProjectID = SMSU.Orders.ProjectID',
              params: { 'Orders.OrderID': { param: 'oid', value: parent.OrderID } },
              top: 1
            })
          }
        },
        samples: {
          type: new GraphQLList(bottle),
          args: { id: { type: GraphQLString } },
          resolve (parent, args, request) {
            var p = {}
            p.OrderID = {param: 'oid', value: parent.OrderID}
            if (args.id) p['SampleNumber'] = {param: 'sid', value: args.id}
            return masterSchemaQueryConstructor({
              select: ['*'],
              from: 'SMSU.OrderDetails',
              params: p,
              top: 2
            })
          }
        },
        receive_date: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return masterSchemaQueryConstructor({
              select: ['ReceiveDate'],
              from: 'SMSU.OrderDetails',
              params: {'OrderID': {param: 'oid', value: parent.OrderID}},
              distinct: true,
              top: 1
            }).then(function (result) { return result.ReceiveDate })
          }
        },
        completed: {
          type: GraphQLBoolean,
          resolve (parent, args, request) {
            try {
              if (fs.statSync(config.AutoPDF + '20' + parent.OrderID.substr(0, 2) + '\\' + parent.OrderID).isDirectory()) {
                return true
              } else {
                return false
              }
            } catch (err) {
              return false
            }
          }
        }
      }
    }
  })

  const sample_location = new GraphQLObjectType({
    name: 'api_location',
    description: 'Detailed information for each unique sampling location/water treatment plant.',
    fields: function () {
      return {
        operation_client: {
          type: client,
          resolve (parent, args, request) {
            return parent
          }
        },
        name: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return parent.ProjectName
          }
        },
        order_counts: {
          type: GraphQLInt,
          args: {
            month_id: { type: GraphQLInt },
            year_id: { type: new GraphQLNonNull(GraphQLInt) }
          },
          resolve (parent, args, request) {
            var p = {}
            if (request.p.CustomerID) p['SMSU.Orders.CustomerID'] = { param: 'cid', value: request.p.CustomerID.value }
            if (parent.ProjectName) p['SMSU.ProjectDefs.ProjectName'] = { param: 'pid', value: parent.ProjectName }
            if (args.month_id > 0) p['MONTH(SMSU.OrderDetails.CollectDate)'] = { param: 'mid', value: args.month_id }
            p['YEAR(SMSU.OrderDetails.CollectDate)'] = { param: 'yid', value: args.year_id }

            return masterSchemaQueryConstructor({
              select: ['COUNT(DISTINCT SMSU.Orders.OrderID) as order_counts'],
              from: 'SMSU.Orders INNER JOIN SMSU.OrderDetails ON SMSU.Orders.OrderID = SMSU.OrderDetails.OrderID INNER JOIN SMSU.ProjectDefs ON SMSU.Orders.CustomerID = SMSU.ProjectDefs.CustomerID AND SMSU.Orders.ProjectID = SMSU.ProjectDefs.ProjectID',
              params: p,
              top: 1
            }).then(function (result) {
              return result.order_counts
            })
          }
        },
        orders: {
          type: new GraphQLList(order),
          args: {
            id: { type: GraphQLInt },
            month_id: { type: GraphQLInt },
            year_id: { type: GraphQLInt }
          },
          resolve (parent, args, request) {
            var p = {}
            if (request.p.CustomerID) p['SMSU.Orders.CustomerID'] = { param: 'cid', value: request.p.CustomerID.value }
            if (parent.ProjectName) p['SMSU.ProjectDefs.ProjectName'] = { param: 'pid', value: parent.ProjectName }
            if (args.id) p['SMSU.Orders.OrderID'] = { param: 'oid', value: args.id }
            if (args.month_id > 0) p['MONTH(SMSU.OrderDetails.CollectDate)'] = { param: 'mid', value: args.month_id }
            if (args.year_id > 0) p['YEAR(SMSU.OrderDetails.CollectDate)'] = { param: 'yid', value: args.year_id }

            return masterSchemaQueryConstructor({
              select: ['SMSU.Orders.OrderID'],
              from: 'SMSU.Orders INNER JOIN SMSU.OrderDetails ON SMSU.Orders.OrderID = SMSU.OrderDetails.OrderID INNER JOIN SMSU.ProjectDefs ON SMSU.Orders.CustomerID = SMSU.ProjectDefs.CustomerID AND SMSU.Orders.ProjectID = SMSU.ProjectDefs.ProjectID',
              params: p,
              top: 2,
              distinct: true
            })
          }
        }
      }
    }
  })

  const client = new GraphQLObjectType({
    name: 'api_client',
    description: 'Identifying information for each client.',
    fields: function () {
      return {
        id: {
          type: GraphQLString,
          resolve (parent, args, request) {
            return parent.CustomerID
          }
        },
        name: {
          type: GraphQLString,
          resolve (parent, args, request) {
            if (parent.CustomerName) {
              return parent.CustomerName
            } else {
              return masterSchemaQueryConstructor({
                select: ['CustomerName'],
                from: 'SMSU.Customers',
                params: {'CustomerID': {param: 'cid', value: parent.CustomerID}}
              }).then(function (results) { return results.CustomerName })
            }
          }
        },
        sample_locations: {
          type: new GraphQLList(sample_location),
          args: { id: { type: GraphQLString } },
          resolve (parent, args, request) {
            var p = {}
            if (request.p.CustomerID) p.CustomerID = { param: 'cid', value: request.p.CustomerID.value }
            if (args.id) p['ProjectName'] = { param: 'pid', value: args.id }
            return masterSchemaQueryConstructor({
              select: ['CustomerID', 'ProjectName'],
              from: 'SMSU.ProjectDefs',
              params: p,
              top: 2,
              distinct: true
            })
          }
        },
        order: {
          type: new GraphQLList(order),
          args: {
            collect_month_id: { type: GraphQLInt },
            collect_year_id: { type: GraphQLInt },
            id: { type: GraphQLString }
          },
          resolve (parent, args, request) {
            var p = {}
            if (request.p.CustomerID) p.CustomerID = { param: 'cid', value: request.p.CustomerID.value }
            if (request.p.ProjectName) p.ProjectName = { param: 'pid', value: request.p.ProjectName.value }
            if (args.collect_month_id > 0) p['MONTH(SMSU.OrderDetails.CollectDate)'] = { param: 'mid', value: args.month_id }
            if (args.collect_year_id > 0) p['YEAR(SMSU.OrderDetails.CollectDate)'] = { param: 'yid', value: args.year_id }
            if (args.id) p['OrderID'] = { param: 'oid', value: args.id }
            return masterSchemaQueryConstructor({
              select: ['*'],
              from: 'SMSU.Orders',
              params: p,
              top: (args.id) ? 1 : 2
            })
          }
        }
      }
    }
  })

  const Query = new GraphQLObjectType({
    name: 'root_query',
    description: 'Base root query object for Chaparral data api_',
    fields: {
      client: {
        type: client,
        args: {
          id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve (parent, args, request) {
          request.p = {}
          request.p['CustomerID'] = { param: 'cid', value: args.id }
          return masterSchemaQueryConstructor({
            select: ['*'],
            from: 'SMSU.Customers',
            params: request.p
          })
        }
      },
      sample_location: {
        type: sample_location,
        args: {
          id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve (parent, args, request) {
          request.p = {}
          request.p['ProjectName'] = { param: 'pid', value: args.id }
          return masterSchemaQueryConstructor({
            select: ['*'],
            from: 'SMSU.ProjectDefs',
            params: request.p
          })
        }
      },
      order: {
        type: order,
        args: {
          id: { type: new GraphQLNonNull(GraphQLString) }
        },
        resolve (parent, args, request) {
          request.p = {}
          if (args.id) request.p['OrderID'] = { param: 'oid', value: args.id }
          return masterSchemaQueryConstructor({
            select: ['*'],
            from: 'SMSU.Orders',
            params: request.p
          })
        }
      }
    }
  })

  const Schema = new GraphQLSchema({ query: Query })

  module.exports = {'schema': Schema}
