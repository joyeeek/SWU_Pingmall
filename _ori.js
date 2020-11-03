var querystring = require('querystring');
var http = require('http');
var utf8 = require('utf8');

module.exports = function(app,fs)
{
    var messageData = " ";
    
    //사용자의 메세지를 JSON으로 bot builder에게 전송
    function readJSONResponse(res) {
    var responseData = '';
    
    res.on('data', function (chunk) {
      responseData += chunk;
    });
    res.on('end', function () {
      var dataObj = JSON.parse(responseData);
      console.log("Raw Response: " +responseData);
      console.log("output: " + dataObj.output.visit_nodes_text);
      
      messageData = JSON.stringify(dataObj.output.visit_nodes_text);
      console.log(messageData);
    });
  }
  //키보드
  app.get('/keyboard', function(req, res){
        fs.readFile( "./data/" + "keyboard.json", 'utf8', function (err, data) {
           console.log(data);
           res.end(data);
        });
    });
    // 메시지
  	app.post('/message', function(req, res){
  		var result = {  };
      //var isGogo = 0;

  		// CHECK REQ VALIDITY/
          if(!req.body["user_key"] || !req.body["type"] || !req.body["content"]){
              result["success"] = 0;
              result["error"] = "invalid request";
              res.json(result);
              return;
          }
      //"사용법"" 이거나 "고고""이면 그에 따른 message를 전송하고 아닐 경우 이해 못함 전송
          if(req.body["content"] == "사용법" || req.body["content"] == "고고") {
            fs.readFile("./data/"+"message.json",'utf8', function(err,data){
              var messages = JSON.parse(data);
              console.log(data);

              if(req.body["content"] == "사용법"){
                messages["message"] = {"text" : "언제든지 \"고고\"를 외쳐주시면 고객센터가 시작됩니다.\n\n그 외에 이전 단계로 가시려면 \"이전\" 다른 쇼핑몰을 검색하시려면 \"처음으로\"를 입력해주세요~\n\n이용을 마치신다면 \"끝\"을 입력해주세요~아무 입력도 없을 시 10분 후 초기화됩니다.\n\nswu핑몰 고객센터에 대한 불편 사항은 \"불편사항\"을 입력해주시면 안내해드리도록 하겠습니다.\n\n즐거운 쇼핑되세요~(쑥스)"};
              }
              else if(req.body["content"] == "고고"){
                messages["message"] = {"text" : "문의하실 쇼핑몰 이름을 말씀해주세요.\n예시)swu핑몰"};
                //isGogo = 1;
              }
              fs.writeFile("./data/message.json",JSON.stringify(messages,null,'\t'),"utf8",function(err,data){
                if(err){
                  console.log(err);
                }
              })
              fs.readFile("./data/message.json",'utf8',function(err,data){
                console.log(data);
                res.end(data);
                return;
              })
            })
          }
          //고고 또는 사용법이 아닐 경우 BOT builder 연동을 통해 자연어 처리 시작
          else {
            //bot builder input JSON
            console.log(req.body["content"]);
            
            var inputtxtinit = req.body["content"];
            var inputJsonObjectDataInit = {
              "story_id": story_id,
              "context": {
                "conversation_id": uuid(), // 각각의 유저와의 대화로 따로 구별하기 위해서 uuid-v4를 이용하여 만든다. 로그관리에 필요하다.
                "information": {
                  "conversation_stack": [
                    {
                      "conversation_node_name": '루트노드'
                      
                    }
                    ],
                    "conversation_counter": 0,
                    "user_request_counter": 0,
                  
                },
                "visit_counter": 0,
                "reprompt": true,
                "retrieve_field": false,
                "message": null,
                "keyboard": null,
                "random": false,
                "input_field": false,
                "variables": null
                
              },
              "input": {
                "text": inputtxtinit
                
              }
              
            };
            
            /*
              var dataString = JSON.stringify(inputData);
              console.log("dataCheck :" + dataString);
              var dataCheck = JSON.stringify(inputData.input.text);
              console.log("check :" + dataCheck);

              var options = {
                host: 'mindmap.ai',
                port:8000,
                path: '/v1/5901f5af65d4400bc56c48b1/',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Content-Length': dataString.length
                }
              };
              */
              
              // request 보내기
              var json = '';
request({
        url: url,
        method: 'POST',
        json: inputJsonObjectDataInit


},
    // response 받기
    function(error, response, body){
        console.log("--------- response된 payload json 시작 ----------");
        console.log(body);
        console.log("--------- response된 payload json 끝 ----------");
        console.log("");
        json = body;

        // 받은 텍스트보기
        var outputTextArray = json["output"]["visit_nodes_text"];
        console.log("outputTextArray: " + outputTextArray.toString());
              
              
              var req = http.request(options, readJSONResponse);
              req.write(dataString);
              req.end();

            fs.readFile("./data/"+"message.json",'utf8', function(err,data){
              var messages = JSON.parse(data);
              console.log(data);

              messages["message"] = {"text" : messageData.substring(2,messageData.length-2)}; //messageData에서 앞 뒤 [,"문자 빼기

              fs.writeFile("./data/message.json",JSON.stringify(messages,null,'\t'),"utf8",function(err,data){
                if(err){
                  console.log(err);
                }
              })
              fs.readFile("./data/message.json",'utf8',function(err,data){
                console.log(data);
                res.end(data);
                return;
              })
            })
          }
      })
    }
