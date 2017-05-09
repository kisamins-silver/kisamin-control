module.exports = {
	'secret':'ChaparralNodeWeb',
	'db':{
     	'name': 'SMv9',
     	'user': 'sa',
     	'password': 'AustinWill6901',
     	'server': 'ChaparralServer\\ChaparralSQL',//'localhost\\ChaparralSQL'
    	'database': 'SMv9'
  	},
  	'ad':{
  		'url':'LDAP://ad.chaparrallabs.com',
  		'baseDN':'DC=ad,DC=chaparrallabs,DC=com',
  		'secure':true,
  		'username':'Administrator@ad.chaparrallabs.com',
  		'password':'AustinWill6901'
  	},
  	'domain':'@ad.chaparrallabs.com',
  	'tokenTimeout':60*60*24, // expires in 24 hours
  	'pdftkFolder': 'Z:\\PDFTKBuilderPortable\\App\\pdftkbuilder\\pdftk.exe',
  	'AutoPDF': 'X:\\',
  	'webUserSQL':"Select Distinct AccountID, Username, Password, CASE isnull(dbo.CLIrpProjectList.CustomerID, '0') WHEN '0' THEN 0 ELSE 1 END AS Type From dbo.CLIrpProjectList WHERE Username = @login AND Password = HASHBYTES('SHA1', CONVERT(nvarchar(4000),@password))",
  	'webClient':{
  		'allPlantsSQL':"Select Distinct ProjectName, SingleProjectName From dbo.CLIrpProjectList Where AccountID = @id;",
  		'allPlantsParams':[
  			{
  				'label':'id',//@ injector for sql from above
  				'var':'id'//variable name for user token object
  			}
  		],
  		'singlePlantsSQL':"SELECT Distinct ProjectLocation, Address, City, State, ZipCode, Description, Active FROM dbo.CLIrpProjectList INNER JOIN SMSU.ProjectDefs ON dbo.CLIrpProjectList.CustomerID = SMSU.ProjectDefs.CustomerID AND dbo.CLIrpProjectList.ProjectName = SMSU.ProjectDefs.ProjectName WHERE (dbo.CLIrpProjectList.AccountID = @id) AND (dbo.CLIrpProjectList.ProjectName = @plant);",
  		'singlePlantsParams':[
  			{
  				'label':'id',
  				'var':'id'
  			},
  			{
  				'label':'plant'
  			}
  		],
  		'singleOrderSQL':"SELECT DISTINCT SMSU.ProjectDefs.CustomerID as CustomerID, SMSU.ProjectDefs.ProjectName as ProjectName, SMSU.Orders.OrderID as OrderID, SMSU.OrderDetails.SampleNumber as SampleNumber, SMSU.SampleDetails.Test as Test, SMSU.SampleDetails.Matrix as Matrix, SMSU.SampleDetails.Method as Method, SMSU.Results.Result as Result, SMSU.Results.Units as Units, SMSU.Results.EnteredDate as EnteredDate, SMSU.Results.ValidatedDate as ValidatedDate, SMSU.Results.ApprovedDate as ApprovedDate FROM SMSU.SampleDetails INNER JOIN SMSU.ProjectDefs INNER JOIN SMSU.Orders INNER JOIN SMSU.OrderDetails ON SMSU.Orders.OrderID = SMSU.OrderDetails.OrderID ON SMSU.ProjectDefs.CustomerID = SMSU.Orders.CustomerID AND SMSU.ProjectDefs.ProjectID = SMSU.Orders.ProjectID ON SMSU.SampleDetails.SampleNumber = SMSU.OrderDetails.SampleNumber INNER JOIN SMSU.Results ON SMSU.SampleDetails.SampleNumber = SMSU.Results.SampleNumber AND SMSU.SampleDetails.Test = SMSU.Results.Test AND SMSU.SampleDetails.Method = SMSU.Results.Method WHERE (SMSU.Orders.OrderID = @orderID) AND (((SMSU.ProjectDefs.ProjectName IN (Select Distinct ProjectName From dbo.CLIrpProjectList Where AccountID = @id) AND SMSU.Orders.CustomerID = (SELECT TOP 1 CustomerID FROM dbo.CLIrpProjectList WHERE AccountID = @id AND ProjectName = SMSU.ProjectDefs.ProjectName)) OR (SMSU.ProjectDefs.ProjectName IN (Select Distinct SingleProjectName From dbo.CLIrpProjectList Where AccountID = @id))));",
  		'singleOrderParams':[
  			{
  				'label':'orderID',
  				'var':''
  			},
  			{
  				'label':'id',
  				'var':'id'
  			}
  		],
  		'plantOrdersSQL':"SELECT DISTINCT SMSU.Orders.OrderID as OrderID FROM SMSU.ProjectDefs INNER JOIN SMSU.Orders ON SMSU.ProjectDefs.CustomerID = SMSU.Orders.CustomerID AND SMSU.ProjectDefs.ProjectID = SMSU.Orders.ProjectID WHERE (((SMSU.ProjectDefs.ProjectName IN (Select Distinct ProjectName From dbo.CLIrpProjectList Where AccountID = @id) AND SMSU.Orders.CustomerID = (SELECT TOP 1 CustomerID FROM dbo.CLIrpProjectList WHERE AccountID = @id AND ProjectName = SMSU.ProjectDefs.ProjectName)) OR (SMSU.ProjectDefs.ProjectName IN (Select Distinct SingleProjectName From dbo.CLIrpProjectList Where AccountID = @id))) AND SMSU.ProjectDefs.ProjectName = @plant)",
  		'plantOrdersParams':[
  			{
  				'label':'id',
  				'var':'id'
  			},
  			{
  				'label':'plant'
  			}
  		]
  	},
  	'port':80,
  	'apiPort':82,
  	'startFn':function(p){console.log('-=-= Server Ready =-=-');console.log('Listening on port: '+p);},
  	'navObj':{
	    'initalView': {
	      'template':'/html/main.html',
	      'js':['/js/main.js'],
	      'post':[
	        {
	          'id':'.modal',
	          'fn':'modal',
	          'args':[]
	        },
	        {//since calls happen repeatedly... destroy old then create new
	          'id':'.button-collapse',
	          'fn':'sideNav',
	          'args':'destroy'
	        },
	        {
	          'id':'.button-collapse',
	          'fn':'sideNav',
	          'args':{'closeOnClick':true,'draggable':true}
	        }
	      ]
	    },
	    'webClient': {
	      'template':'/reporting/html/client_reporting.html',
	      'js':['/reporting/js/client_reporting.js'],
	      'post':[
	        {
	          'id':'.collapsible',
	          'fn':'collapsible',
	          'args':[]
	        },
	        {//since calls happen repeatedly... destroy old then create new
	          'id':'.button-collapse',
	          'fn':'sideNav',
	          'args':'destroy'
	        },
	        {
	          'id':'.button-collapse',
	          'fn':'sideNav',
	          'args':{'closeOnClick':true,'draggable':true}
	        }
	      ]
	    }
	  },
	'weatherAPIToken':'fjzwvgDGQvcqkBeTmehvkNldPQRWvFrz',
	'weatherAPIUrl':'https://www.ncdc.noaa.gov/cdo-web/api/v2/'
};