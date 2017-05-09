module.exports = {
  	'tokenTimeout':60*60*24, // expires in 24 hours
  	'port':80,
  	'apiPort':82,
  	'startFn':function(p){console.log('-=-= Server Ready =-=-');console.log('Listening on port: '+p);}
};