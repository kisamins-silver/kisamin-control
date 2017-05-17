const config = require('../config')
const fs = require('fs')
const path = require('path')
const data_dir = process.env.OPENSHIFT_DATA_DIR || __dirname
const ipRangeCheck = require('ip-range-check')

const avatars = require(path.format({root:'/',dir:data_dir,base:'avatars.json'}))
var slaves = avatars.slaves
var owner = avatars.owner

const _ = require('lodash')

const graphqlReq = require('graphql')
const GraphQLID = graphqlReq.GraphQLID
const GraphQLSchema = graphqlReq.GraphQLSchema
const GraphQLObjectType = graphqlReq.GraphQLObjectType
const GraphQLString = graphqlReq.GraphQLString
const GraphQLList = graphqlReq.GraphQLList
const GraphQLInt = graphqlReq.GraphQLInt
const GraphQLBoolean = graphqlReq.GraphQLBoolean
const GraphQLNonNull = graphqlReq.GraphQLNonNull

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
				type: new GraphQLList ( slave_avatar ),
				resolve (parent, args, request) {
					var slavelist = []
					for (var x = 0; x < slaves.length; x++ ){
					console.log(slaves[x])
						if ( slaves[x].owner.avatar.key == parent.avatar.key ) slavelist.push(slaves[x])
					}
					return slavelist
				}
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

				var requester = { id: request.headers['x-secondlife-owner-key'], isSlave: false }

				//either no owner key is supplied, or kisamin is requested as owner
				if(!args.owner_key || (args.owner_key && args.owner_key == owner.avatar.key)) {
					//check if person requesting is a slave
					for(var x; x < slaves.length; x++){
						if(requester.id == slaves[x].avatar.key) requester.isSlave = true
					}
					if(requester.isSlave || requester.id == owner.avatar.key || !requester.id){
						//if requester is either a slave or kisamin or is a web query
						return [owner]
					}else{
						//prevent third party in world queries
						return []
					}
				}else{
					//invalid owner key supplied
					return []
				}
			}
		},
		slaves: {
			type: new GraphQLList ( slave_avatar ),
			args: {
				slave_key: { type: GraphQLString },
				owner_key: { type: GraphQLString }
			},
			resolve (parent, args, request) {
				var o = args.owner_key
				var s = args.slave_key
				var h = request.headers['x-secondlife-owner-key']
				var arr = []

				var ip = request.headers['x-forwarded-for'].split(',').pop() || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress
				console.log(ip)
				if( !h || ipRangeCheck ( ip, config.second_life_IP_ranges ) ) {
					console.log('successful ip check')

					if ( h && h != owner.avatar.key ) {
						console.log('force slave key')
						s = h
					}

					console.log(o)
					console.log(s)
					console.log(h)
					console.log('beginning slave checks')
					for ( var x = 0; x < slaves.length; x++ ) {
						var ts = slaves[x]
						console.log(ts)

						if ( s && s == ts.avatar.key && ( !o || o == ts.owner.avatar.key ) ) return [ts]
						if ( o && o == ts.owner.avatar.key ) arr.push(ts)
					}

					return arr
				}else{
					console.log('bad ip range')
					return []
				}
			}
		}
	}
})

const Schema = new GraphQLSchema({ query: Query })

module.exports = {'schema': Schema}

/*
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

	var jasmine = {
		avatar: {
			key: "ebbc1a37-467e-4a22-9078-a4e19c295ed9",
			username: "Tshira Resident",
			display_name: "Jasmine Safire"
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
		owned_slaves: [silver, lucy, andrea, jasmine]
	}

	var storepath = path.format({root:'/',dir:data_dir,base:'avatars.json'})

	fs.writeFile(storepath,JSON.stringify({slaves:[silver, andrea, lucy, jasmine],owner:kisamin}) , function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The file was saved to: "+storepath);
	});
*/