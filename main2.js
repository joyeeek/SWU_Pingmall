var querystring = require('querystring');
var http = require('http');
var iconv = require('iconv').Iconv;
var ic = new iconv.Iconv('iso-8859-1', 'utf-8');

var inputData = {
  "story_id": "5901f5af65d4400bc56c48b1",
  "context": {
    "conversation_id": "d377c115-60db-4fc1-9480-845cdac0630c",
    "visit_counter": 0,
    "variables": null,
    "reprompt": false,
    "retrieve_field": false,
    "information": {
      "conversation_counter": 1,
      "user_request_counter": 1,
      "conversation_stack": [
        {
          "conversation_node_name": ".start",
          "conversation_node": "4eec2c98-1ee8-7f70-ba72-b711ee91c2c5"
        }
      ]
    },
    "input_field": null
  },
  "input": {
    "text": "입금"
  }
}
  var dataString = JSON.stringify(inputData);

  var options = {
    host: 'mindmap.ai',
    port:8000,
    path: '/v1/5901f5af65d4400bc56c48b1/',
    method: 'POST',
    encoding: null,
    headers: {
      'Content-Type': 'application/json; charset = utf-8',
      'Content-Length': dataString.length
    }
  };
  function readJSONResponse(res) {
    var responseData = '';
    
    res.on('data', function (chunk) {
      responseData += ic.convert(chunk).toString('utf-8');;
    });
    res.on('end', function () {
      var dataObj = JSON.parse(responseData);
      console.log("Raw Response: " +responseData);
      console.log("output: " + dataObj.output.text);
    });
  }
  var req = http.request(options, readJSONResponse);
  req.write(dataString);
  req.end();
