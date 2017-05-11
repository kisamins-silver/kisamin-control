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
	restrictions: []
  }

  var andrea = {
	avatar: {
		key: "f6114045-8826-4cd2-ada8-7f1fa0b88476",
		username: "Andrea80 Sands",
		display_name: "andrea"
	},
	owner: function(){return kisamin},
	restrictions: []
  }

  var kisamin = {
	avatar: {
		key: "c4421daa-bb7a-47ab-8d99-a8c5671ac3e6",
		username: "Kisamin Resident",
		display_name: "Kisamin"
	},
	owned_slaves: [silver, lucy, andrea]
  }

   module.exports = {'slaves': [silver,lucy,andrea], 'owner': kisamin}