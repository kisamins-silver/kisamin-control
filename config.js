module.exports = {
  	'tokenTimeout':60*60*24, // expires in 24 hours
  	'port':8080,
	'ip':'127.0.0.1',
	'second_life_IP_ranges':[ // taken from http://wiki.secondlife.com/wiki/Simulator_IP_Addresses
		{'start':'8.2.32.0/22','end':'8.2.35.255'},
		{'start':'8.4.128.0/22','end':'8.4.131.255'},
		{'start':'8.10.144.0/21','end':'8.10.151.255'},
		{'start':'63.210.156.0/22','end':'63.210.159.255'},
		{'start':'64.154.220.0/22','end':'64.154.223.255'},
		{'start':'216.82.0.0/18','end':'216.82.63.255'}
	],
  	'startFn':function(p){console.log('-=-= Server Ready =-=-');console.log('Listening on port: '+p);}
};