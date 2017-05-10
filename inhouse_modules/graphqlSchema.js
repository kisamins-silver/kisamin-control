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

  var silver = {
	avatar: {
		key: "bea2df0a-0929-4ea7-bcdb-a14c11c8aa6b",
		username: "lilshino Resident",
		display_name: "Kisa's Silver"
	},
	owner: function(){return kisamin},
	restrictions: [
		{
			command: "abc",
			allow: false
		},
		{
			command: "123",
			allow: true
		}
	]
  }

  var lucy = {
	avatar: {
		key: "a6d66178-5d32-4bdf-86a3-a4c24733d790",
		username: "LucyAtreides Resident",
		display_name: "LucyAtreides"
	},
	owner: function(){return kisamin},
	restrictions: [
		{
			command: "abc",
			allow: false
		},
		{
			command: "123",
			allow: true
		}
	]
  }

  var andrea = {
	avatar: {
		key: "f6114045-8826-4cd2-ada8-7f1fa0b88476",
		username: "Andrea80 Sands",
		display_name: "andrea"
	},
	owner: function(){return kisamin},
	restrictions: [
		{
			command: "abc",
			allow: false
		},
		{
			command: "123",
			allow: true
		}
	]
  }

  var kisamin = {
	avatar: {
		key: "c4421daa-bb7a-47ab-8d99-a8c5671ac3e6",
		username: "Kisamin Resident",
		display_name: "Kisamin"
	},
	owned_slaves: [silver, lucy, andrea]
  }

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
				owned_slaves: {
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
          owner_key: { type: GraphQLString }
        },
        resolve (parent, args, request) {
          return [kisamin]
        }
      },
      slaves: {
        type: new GraphQLList ( slave_avatar ),
        args: {
          slave_key: { type: GraphQLString },
		  owner_key: { type: GraphQLString }
        },
        resolve (parent, args, request) {
		if(request.headers['x-secondlife-owner-key']) return [silver]
		switch(args.slave_key){
			case "bea2df0a-0929-4ea7-bcdb-a14c11c8aa6b":
				return [silver]
				break
			case "a6d66178-5d32-4bdf-86a3-a4c24733d790":
				return [lucy]
				break
			case "f6114045-8826-4cd2-ada8-7f1fa0b88476":
				return [andrea]
				break
			default:
				if(args.slave_key) return []
				return [silver,lucy,andrea]
		}
		}
      }
    }
  })

  const Schema = new GraphQLSchema({ query: Query })

  module.exports = {'schema': Schema}
