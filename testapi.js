var querystring = require('querystring');
var https = require('https');

function performRequest(data, success) {
  var dataString = JSON.stringify(data);

  var options = {
    host: 'mindmap.ai',
    port:8000,
    path: '/v1/5901f5af65d4400bc56c48b1/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      console.log(responseString);
      var responseObject = JSON.parse(responseString);
      success(responseObject);
    });
  });

  req.write(dataString);
  req.end();
}

function login() {
  performRequest( {input:"5"}, function(data) {
    sessionId = data.result.output;
    console.log('Logged in:', sessionId);
  });
}
