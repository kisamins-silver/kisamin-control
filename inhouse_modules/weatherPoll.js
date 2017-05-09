  //master config file
  var config      = require('../config');
  var ajax        = require('request');

  // NOAA Weather API functions
  function weatherJoiner(chartObj, prasedData, callback){ //combine prased data into current chart obj
    for(var x=0; x<prasedData.series.length; x++){
      var sIdx = chartObj.series.indexOf(prasedData.series[x]);
      if(sIdx===-1){
        chartObj.series.push(prasedData.series[x]);
        sIdx = chartObj.series.length-1;
      }
      for(var y=0; y<prasedData.labels.length; y++){
        var lIdx = chartObj.labels.indexOf(prasedData.labels[y]);
        var v = prasedData.data[x][y];
        if(lIdx===-1){
          chartObj.labels.push(prasedData.labels[y]);
          lIdx = chartObj.labels.length-1;
        }
        if(!chartObj.data[chartObj.series.indexOf(prasedData.series[x])]){chartObj.data[chartObj.series.indexOf(prasedData.series[x])]=[];}
        chartObj.data[sIdx].splice(lIdx,0,v);
      }
    }
    callback(chartObj);
  }

  function weatherPrase(data,reqTypes,callback){ //prase noaa raw data into chart ready obj
    var retObj = {data:[],labels:[],series:[]};

    var types = _.groupBy(data,'datatype');
    _.forEach(types,function(dataArray,dataType){
      if(reqTypes.indexOf(dataType)>-1){
        var dates = _.groupBy(dataArray,'date');
        retObj.series.push(dataType);
        retObj.data.push([]);
        _.forEach(dates,function(valueArray,dateStr){
          var dstr = moment(dateStr).format('MM-DD-YYYY');
          if(retObj.labels.indexOf(dstr)===-1){retObj.labels.push(dstr);}
          retObj.data[retObj.data.length-1].splice(retObj.labels.indexOf(dstr),0,valueArray[0].value);
        });
      }
    });
    callback(retObj);
  }

  function weatherGet(req,callback){ //get data from noaa api
    ajax({
      method: 'GET',
      url: weatherUrlPrefix
            +'data?offset='+req.offset
            +'&datasetid='+req.datasetid
            +'&locationid='+req.locationid
            +'&startdate='+req.startdate
            +'&enddate='+req.enddate
            +'&units='+req.units
            +'&limit='+req.limit,
      headers: {'token':weatherToken},
      json:true
    },
      function(error,response,body){
        if(!error){
          var d = [];
          var c = 0;
          var l = 0;
          if(body.metadata){
            d = body.results;
            c = body.metadata.resultset.count;
            l = body.metadata.resultset.limit;
          }
          callback({error:null,data:d,count:c,limit:l});
        }else{
          callback({error:error,data:null});
        }
      }
    );
  }

  function weatherPoll(chartObj,offset,callback){ //main controller function for getting, prasing and joining noaa data

    var reqObj = {
      datasetid: chartObj.datasetid || 'GHCND',
      datatypeid: chartObj.datatypeid || 'TAVG',
      locationid: chartObj.locationid || 'ZIP:77320',
      startdate: chartObj.startdate || chartObj.sDate,
      enddate: chartObj.enddate || chartObj.eDate,
      units: 'standard',
      offset:offset,
      limit:1000
    };

    weatherGet(reqObj,function(result){
      if(offset<2){
        if(!result.error){
          var types = chartObj.desiredTypes || [];
          weatherPrase(result.data,types,function(data){
            weatherJoiner(chartObj, data, function(joined){
              if(offset<(result.count-result.limit)){
                weatherPoll(chartObj,offset+result.limit,callback);
              }else{
                callback(true);
              }
            });
          });

        }else{
          callback(false);
        }
      }
    });
  }

  module.exports={"a":"2"};