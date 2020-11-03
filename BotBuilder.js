/**
 * Created by neo on 2017. 5. 10..
 */
console.log("--------- Mindmap.ai의 Restful api와 통신하는 Nodejs 예제입니다. ----------");

// var http = require('http');  // 이것을 사용하면, 한글 적용시 에러가 나서 안쓰시길 권장합니다. 에러발생
var request = require('request');    // $ npm install request
var uuid = require('uuid-v4');  // $ npm install uuid-v4

// api url 및 story_id 설정
var story_id = "5926ba7065d440554f015b39"; // <-- [중요] 적용할 스토리아이디 입력 : 스토리리스트>>만든 스토리 메뉴중 채널 클릭>>채널정보 화면에서 취득
var url = 'http://mindmap.ai:8000/v1/' + story_id + '/';

// [중요] 맨처음 보낼 initial default payload 작성한다.
// 그 후는 아래에서 ('// **다시 보낼 payload 재가공하기':line 72 참조) 재가공된 new_inputJsonObjectData 를 이용하세요.
// 그래야지 mindmap 스토리가 잘 작동합니다.
// 초기에 아래의 default 값을 이렇게 보내면 마인드맵의 .start가 실행되어 그 대화표시 payload 가 반환된다.
var inputtxtinit = "ok";
var inputJsonObjectDataInit = {
    "story_id": story_id,
    "context": {
        "conversation_id": uuid(), // 각각의 유저와의 대화로 따로 구별하기 위해서 uuid-v4를 이용하여 만든다. 로그관리에 필요하다.
        "information": {
            "conversation_stack": [
                {
                    "conversation_node": 'root',
                    "conversation_node_name": '루트노드'
                }
            ],
            "conversation_counter": 1,
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
        


        // ** 다시 보낼 payload 재가공하기
        console.log("");
        console.log("--------- payload 를 받고서 보낼 new_inputJsonObjectData 재가공하기 시작 ----------");
        var new_inputtxt = '고고';  // 이부분만 재가공하여 처리하여 다시 메시지를 보내면 된다.
        var new_context = json['context'];
        var new_inputJsonObjectData = {
            "story_id": story_id,
            "context": new_context,
            "input": {
                "text": new_inputtxt
            }

        }
        console.log("받은 context 지만 다시 보낼 context: " + JSON.stringify(new_context));  // 그대로 보내야지 변수들이 유지되어 mindmap이 잘 작동한다.
        console.log("가공후 새롭게 보낼 new_inputtxt: " + new_inputtxt);
        console.log("재가공된  'new_inputJsonObjectData' 이걸 다시 request를 만들어 보내면 된다. : " + JSON.stringify(new_inputJsonObjectData));
        console.log("------------ 보낼 new_inputJsonObjectData 재가공하기 끝 ----------");
});


// simple request & response sample
// // request 보내기
// var json = '';
// request({
//     url: url,
//     method: 'POST',
//     json: inputJsonObjectData
//
// },
//     // response 받기
//     function(error, response, body){
//     console.log(body);
//     json = body;
//     var outputTextArray = json["output"]["visit_nodes_text"];
//     console.log("outputTextArray: " + outputTextArray.toString());
//     for(var i=0 ; i < outputTextArray.length ; i++){
//         //실행된 모든 노드의 대답을 표시한다
//         console.log(outputTextArray[i]);
//     }
//
// });
