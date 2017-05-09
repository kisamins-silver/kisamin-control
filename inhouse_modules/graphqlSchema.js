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

	const rlv_command = new GraphQLObjectType({
		name: 'rlv_command',
		description: 'Individual RLV commands and paramaters.',
		fields: function () {
			return {
				command: {
					type: GraphQLString,
					resolve (parent, args, request) {
						// command to be applied (detach in @detach=y/n)
						return parent.command
					}
				},
				allow: {
					type: GraphQLBoolean,
					resolve (parent, args, request) {
						// whether or not the command is to allow or restrict (y/n in @detach=y/n)
						return parent.allow
					}
				},
				avatar: {
					type: avatar,
					resolve (parent, args, request) {
						// person to include with command (avatar key in @allowForceTP=avatar key {person to allow to force tp the person with the restriction})
						return parent.avatar
					}
				}
			}
		}
	})

	const avatar = new GraphQLObjectType({
		name: 'avatar',
		description: 'Second Life avatar.',
		fields: function () {
			return {
				key: {
					type: GraphQLString
				},
				username: {
					type: GraphQLString
				},
				display_name: {
					type: GraphQLString
				}
			}
		}
	})

	const slave_avatar = new GraphQLObjectType({
		name: 'slave_avatar',
		description: 'Second Life avatar submitting to be owned property, giving up all rights to their owner as stored in this system.',
		fields: function () {
			return {
				avatar: {
					type: avatar
				},
				restrictions: {
					type: new GraphQLList( rlv_command )
				},
				owner: {
					type: owner_avatar
				}
			}
		}
	})

	const owner_avatar = new GraphQLObjectType({
		name: 'owner_avatar',
		description: 'Second Life avatar who owns slaves to be stored in this system.',
		fields: function () {
			return {
				avatar: {
					type: avatar
				},
				slaves: {
					type: new GraphQLList ( slave_avatar )
				}
			}
		}
	})

  const Query = new GraphQLObjectType({
    name: 'root_query',
    description: 'Base root query object for slavery data api.',
    fields: {
      owners: {
        type: new GraphQLList ( owner_avatar ),
        args: {
          avatar: { type: avatar }
        },
        resolve (parent, args, request) {
          return args
        }
      },
      slaves: {
        type: new GraphQLList ( slave_avatar ),
        args: {
          avatar: { type: avatar }
        },
        resolve (parent, args, request) {
          return args
        }
      }
    }
  })

  const Schema = new GraphQLSchema({ query: Query })

  module.exports = {'schema': Schema}
