var request = require('request');
var util = require('../util');

module.exports = function (param) {
  var	channel		= param.channel;
  var QUERY_KEY_INSIGHTS = process.env.QUERY_KEY_INSIGHTS;
  var nrqlquery = "";
  for (j=0; j < param.args.length; j++) {
    nrqlquery = nrqlquery + ' ' + param.args[j];
  }
  nrqlquery = nrqlquery.toLowerCase();
  nrqlquery = nrqlquery.replace("pageview", "PageView");
  nrqlquery = nrqlquery.replace("transaction", "Transaction");
  endpoint = param.commandConfig.endpoint+encodeURI(nrqlquery);
  // Setup the Insights query options
  var options = {
    uri: endpoint,
    headers: {'X-Query-Key': QUERY_KEY_INSIGHTS},
    Accept: 'application/json'
  };
var nrqlResponse;
var finaloutput;
//Make the request for Insights Data
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      nrqlResponse = JSON.parse(body);
      //If the query was a facet
      if(nrqlquery.toLowerCase().indexOf('facet') >= 0) {
        for (k=0; k < nrqlResponse.facets.length; k++) {
          finaloutput = finaloutput + nrqlResponse.facets[k].name + '     ' + nrqlResponse.facets[k].results[0].average + '\n';
        }
      }
      //If the query was not a facet
      if(nrqlquery.toLowerCase().indexOf('facet') < 0) {
          finaloutput = nrqlResponse.results[0].average + '\n';
      }
      util.postMessage(param.channel, finaloutput);
    } else {
      util.postMessage(param.channel, ' Insights request error: ' + error);
    }
  });
};
