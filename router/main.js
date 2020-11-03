var querystring = require('querystring');
var utf8 = require('utf8');
var uuid = require('uuid-v4');
var request = require('request');
var mysql = require('mysql');
var cheerio = require('cheerio');
var async = require('async');
var qs = require('querystring');

var connection = mysql.createConnection({
    host: process.env.IP,
    user: process.env.C9_USER,
    password: '',
    database: 'swudb'
})


connection.connect();

module.exports = function(app, fs) {
        var new_context;


        //키보드
        app.get('/keyboard', function(req, res) {
            fs.readFile("./data/" + "keyboard.json", 'utf8', function(err, data_key) {
                console.log("keybord" + data_key);
                var result_1;
                
                //app.post('/message',function(req, res) {
                    var data = fs.readFileSync("./data/" + "message.json", 'utf8');
                    var messages = JSON.parse(data);

                    messages["message"] = {
                        "text": "gpgpgppg"
                    };
                    fs.writeFileSync("./data/message.json", JSON.stringify(messages, null, '\t'), "utf8");
                    var data_1 = fs.readFileSync("./data/message.json", 'utf8'); // {
                                    console.log("read" + data);

                                    var result = data_1.replace(/<br>/g, '\\n');
                                    //res.end(result);
                                    result_1 = result.substring(1,result.length-1);
                                    console.log(result_1);

               //})
               data = data_key.substring(0,data_key.length-1);
               var end = "{\"keyboard\" : "+data_key + result_1 + '}';
               console.log("ㅎㅎㅎㅎ" + end);
                res.end(end);
            });

        });
        // 친구추가
        app.post('/friend', function(req, res) {
            var result = {};

            // 요청 param 체크
            if (!req.body["user_key"]) {
                result["success"] = 0;
                result["error"] = "invalid request";
                res.json(result);
                return;
            }

            // 파일 입출력
            fs.readFile("./data/" + "friend.json", 'utf8', function(err, data) {
                var users = JSON.parse(data);
                // 이미 존재하는 친구일 경우
                if (users[req.body["user_key"]]) {
                    result["success"] = 0;
                    result["error"] = "duplicate";
                    res.json(result);
                    return;
                }

                // 친구추가
                users[req.body["user_key"]] = req.body;
                fs.writeFile("./data/" + "friend.json", JSON.stringify(users, null, '\t'), "utf8", function(err, data) {
                    result = 200;
                    res.json(result);
                    return;
                })
            })

        });

        // 친구삭제(차단)
        app.delete('/friend/:user_key', function(req, res) {
            var result = {};

            // 파일 입출력
            fs.readFile("./data/" + "friend.json", "utf8", function(err, data) {
                var users = JSON.parse(data);

                // 존재하지 않는 친구일 경우
                if (!users[req.params.user_key]) {
                    result["success"] = 0;
                    result["error"] = "not found";
                    res.json(result);
                    return;
                }
                // 친구 삭제
                delete users[req.params.user_key];
                fs.writeFile("./data/" + "friend.json", JSON.stringify(users, null, '\t'), "utf8", function(err, data) {
                    result = 200;
                    res.json(result);
                    return;
                })
            })
        })

        // 채팅방 나가기
        app.delete('/chat_room/:user_key', function(req, res) {
            var result = {};
            result = 200;
            res.json(result);
            return;
        })

        // 메시지
        app.post('/message', function(req, res) {
                var result = {};
                var story_id = "5926ba7065d440554f015b39";
                var url = 'http://mindmap.ai:8000/v1/' + story_id + '/';

                // CHECK REQ VALIDITY/
                if (!req.body["user_key"] || !req.body["type"] || !req.body["content"]) {
                    result["success"] = 0;
                    result["error"] = "invalid request";
                    res.json(result);
                    return;
                }

                //"사용법"" 이거나 "고고""이면 그에 따른 message를 전송하고 아닐 경우 이해 못함 전송
                if (req.body["content"] == "사용법" || req.body["content"] == "고고" || req.body["content"] == "불편사항") {
                    var data = fs.readFileSync("./data/" + "message.json", 'utf8');
                    var messages = JSON.parse(data);

                    if (req.body["content"] == "사용법") {
                        var inputtxtinit = "사용법";
                        var inputJsonObjectDataInit = {
                            "story_id": story_id,
                            "context": {
                                "conversation_id": req.body["user_key"],
                                "random": false,
                                "visit_counter": 0,
                                "reprompt": false,
                                "information": {
                                    "user_request_counter": 1,
                                    "conversation_stack": [{
                                        "conversation_node_name": "루트노드",
                                        "conversation_node": "root"

                                    }],
                                    "conversation_counter": 1
                                },
                                "retrieve_field": false,
                                "message": null,
                                "input_field": null,
                                "variables": null,
                                "keyboard": {
                                    "buttons": [
                                        "사용법",
                                        "고고"
                                    ],
                                    "type": "buttons"
                                }
                            },
                            "input": {
                                "text": inputtxtinit
                            }
                        };
                        var json = '';
                        request({
                                    url: url,
                                    method: 'POST',
                                    json: inputJsonObjectDataInit
                                },

                                // response 받기, request의 콜백
                                function(error, response, body) {
                                    console.log("--------- response된 payload json 시작 ----------");
                                    console.log(body);
                                    console.log("--------- response된 payload json 끝 ----------");
                                    console.log("");
                                    json = body;

                                    // 받은 텍스트보기
                                    var outputTextArray = json["output"]["visit_nodes_text"];
                                    console.log("outputTextArray: " + outputTextArray.toString());
                                    for (var i = 0; i < outputTextArray.length; i++) {
                                        //실행된 모든 노드의 대답을 표시한다
                                        console.log(outputTextArray[i]);
                                    }
                                    messages["message"] = {
                                        "text": outputTextArray.toString()
                                    };

                                    fs.writeFileSync("./data/message.json", JSON.stringify(messages, null, '\t'), "utf8"); // {
                                    // if (err) {
                                    //   console.log(err);
                                    // }
                                    console.log("write");
                                    // })

                                    var data_1 = fs.readFileSync("./data/message.json", 'utf8'); // {
                                    console.log("read" + data);

                                    var result = data_1.replace(/<br>/g, '\\n');
                                    console.log("result : " + result);
                                    console.log("data_1" + data_1);


                                    res.end(result);
                                    //  return;
                                    // })
                                    //})
                                })
                            //status = 1;
                    }
                    else if (req.body["content"] == "고고") {
                        var inputtxtinit = "고고";

                        var inputJsonObjectDataInit = {
                            "story_id": story_id,
                            "context": {
                                "conversation_id": req.body["user_key"],
                                "random": false,
                                "visit_counter": 0,
                                "reprompt": false,
                                "information": {
                                    "user_request_counter": 1,
                                    "conversation_stack": [{
                                        "conversation_node_name": "루트노드",
                                        "conversation_node": "root"
                                    }],
                                    "conversation_counter": 1
                                },
                                "retrieve_field": false,
                                "message": null,
                                "input_field": null,
                                "variables": null,
                                "keyboard": {
                                    "buttons": [
                                        "사용법",
                                        "고고"
                                    ],
                                    "type": "buttons"
                                }
                            },
                            "input": {
                                "text": inputtxtinit
                            }
                        };

                        var json = '';
                        request({
                                url: url,
                                method: 'POST',
                                json: inputJsonObjectDataInit
                            },
                            // response 받기
                            function(error, response, body) {
                                console.log("--------- response된 payload json 시작 ----------");
                                console.log(body);
                                console.log("--------- response된 payload json 끝 ----------");
                                console.log("");
                                json = body;

                                // 받은 텍스트보기
                                var outputTextArray = json["output"]["visit_nodes_text"];
                                console.log("outputTextArray: " + outputTextArray[0].toString());
                                for (var i = 0; i < outputTextArray.length; i++) {
                                    //실행된 모든 노드의 대답을 표시한다
                                    console.log(outputTextArray[i]);
                                }

                                messages["message"] = {
                                    "text": outputTextArray[0].toString()
                                };
                                console.log("message : " + messages["message"]["text"]);

                                new_context = json['context'];
                                console.log("output_context :" + new_context.conversation_id);

                                var task = [
                                    function(callback) {
                                        var sql_select = 'SELECT user_key FROM input WHERE user_key = \'' + req.body["user_key"] + ' \'';
                                        var row_select;
                                        //user_key 존재여부 검색
                                        connection.query(sql_select, function(err, row, fields) {
                                            if (err) {
                                                console.log("db query error");

                                                console.log(err);
                                                return callback(err);
                                            }
                                            else {
                                                console.log("db connect");
                                                console.log("row : " + JSON.stringify(row[0]));
                                                console.log("fields :" + fields[0]);
                                                callback(null, row[0]);

                                                //row_select = JSON.stringify(row[0]);
                                                //console.log("row_select : " + row_select);
                                            }
                                        });
                                    },
                                    function(data, callback) {
                                        //이미 저장된 user -> update , 새로운 user -> insert
                                        console.log("data : " + JSON.stringify(data));

                                        if (JSON.stringify(data) != undefined) {
                                            //Database에 userkey와 context저장
                                            var sql = 'UPDATE input SET context = ? WHERE user_key = ?'
                                            var params = [JSON.stringify(new_context), req.body["user_key"]];

                                            connection.query(sql, params, function(err, row, fields) {
                                                if (err) {
                                                    console.log("db query error:update");
                                                    console.log(err);
                                                    return callback(err);
                                                }
                                                else {
                                                    console.log("db connect : update");
                                                    console.log("row : " + row);
                                                    console.log("fields :" + fields);
                                                    //console.log(row_select);
                                                    callback(null);
                                                }

                                            });
                                        }
                                        else {
                                            var sql = 'INSERT INTO input(user_key, context) VALUES(?,?)';
                                            var params = [req.body["user_key"], JSON.stringify(new_context)];

                                            connection.query(sql, params, function(err, row, fields) {
                                                if (err) {
                                                    console.log("db query error:insert");
                                                    console.log(err);
                                                    //console.log(row_select);

                                                    return callback(err);
                                                }
                                                else {
                                                    console.log("db connect: insert");
                                                    console.log("row : " + row);
                                                    console.log("fields :" + fields);
                                                    // console.log(row_select);
                                                    callback(null);
                                                }
                                            });
                                        }

                                    }
                                ];

                                async.waterfall(task, function(err) {
                                    if (err)
                                        console.log('err');
                                    else
                                        console.log('done');
                                });

                                fs.writeFileSync("./data/message.json", JSON.stringify(messages, null, '\t'), "utf8"); // {
                                console.log("write");
                                var data_1 = fs.readFileSync("./data/message.json", 'utf8'); // {

                                console.log("read" + data);
                                var result = data_1.replace(/<br>/g, '\\n');
                                res.end(result);
                            });
                    }
                    else if (req.body["content"] == "불편사항") {
                        var inputtxtinit = "불편사항";

                        var inputJsonObjectDataInit = {
                            "story_id": story_id,
                            "context": {
                                "conversation_id": req.body["user_key"],
                                "random": false,
                                "visit_counter": 0,
                                "reprompt": false,
                                "information": {
                                    "user_request_counter": 1,
                                    "conversation_stack": [{
                                        "conversation_node_name": "루트노드",
                                        "conversation_node": "root"
                                    }],
                                    "conversation_counter": 1
                                },
                                "retrieve_field": false,
                                "message": null,
                                "input_field": null,
                                "variables": null,
                                "keyboard": null,
                            },
                            "input": {
                                "text": inputtxtinit
                            }
                        };

                        var json = '';
                        request({
                                url: url,
                                method: 'POST',
                                json: inputJsonObjectDataInit
                            },
                            // response 받기
                            function(error, response, body) {
                                console.log("--------- response된 payload json 시작 ----------");
                                console.log(body);
                                console.log("--------- response된 payload json 끝 ----------");
                                console.log("");
                                json = body;

                                // 받은 텍스트보기
                                var outputTextArray = json["output"]["visit_nodes_text"];
                                console.log("outputTextArray: " + outputTextArray[0].toString());
                                for (var i = 0; i < outputTextArray.length; i++) {
                                    //실행된 모든 노드의 대답을 표시한다
                                    console.log(outputTextArray[i]);
                                }

                                messages["message"] = {
                                    "text": outputTextArray[0].toString()
                                };
                                console.log("message : " + messages["message"]["text"]);

                                new_context = json['context'];
                                console.log("output_context :" + new_context.conversation_id);

                                var task = [
                                    function(callback) {
                                        var sql_select = 'SELECT user_key FROM input WHERE user_key = \'' + req.body["user_key"] + ' \'';
                                        var row_select;
                                        //user_key 존재여부 검색
                                        connection.query(sql_select, function(err, row, fields) {
                                            if (err) {
                                                console.log("db query error");

                                                console.log(err);
                                                return callback(err);
                                            }
                                            else {
                                                console.log("db connect");
                                                console.log("row : " + JSON.stringify(row[0]));
                                                console.log("fields :" + fields[0]);
                                                callback(null, row[0]);

                                            }
                                        });
                                    },
                                    function(data, callback) {
                                        //이미 저장된 user -> update , 새로운 user -> insert
                                        console.log("data : " + JSON.stringify(data));

                                        if (JSON.stringify(data) != undefined) {
                                            //Database에 userkey와 context저장
                                            var sql = 'UPDATE input SET context = ? WHERE user_key = ?'
                                            var params = [JSON.stringify(new_context), req.body["user_key"]];

                                            connection.query(sql, params, function(err, row, fields) {
                                                if (err) {
                                                    console.log("db query error:update");
                                                    console.log(err);
                                                    return callback(err);
                                                }
                                                else {
                                                    console.log("db connect : update");
                                                    console.log("row : " + row);
                                                    console.log("fields :" + fields);
                                                    //console.log(row_select);
                                                    callback(null);
                                                }

                                            });
                                        }
                                        else {
                                            var sql = 'INSERT INTO input(user_key, context) VALUES(?,?)';
                                            var params = [req.body["user_key"], JSON.stringify(new_context)];

                                            connection.query(sql, params, function(err, row, fields) {
                                                if (err) {
                                                    console.log("db query error:insert");
                                                    console.log(err);
                                                    //console.log(row_select);

                                                    return callback(err);
                                                }
                                                else {
                                                    console.log("db connect: insert");
                                                    console.log("row : " + row);
                                                    console.log("fields :" + fields);
                                                    // console.log(row_select);
                                                    callback(null);
                                                }
                                            });
                                        }

                                    }
                                ];

                                async.waterfall(task, function(err) {
                                    if (err)
                                        console.log('err');
                                    else
                                        console.log('done');
                                });

                                fs.writeFileSync("./data/message.json", JSON.stringify(messages, null, '\t'), "utf8"); // {
                                console.log("write");
                                var data_1 = fs.readFileSync("./data/message.json", 'utf8'); // {

                                console.log("read" + data);
                                var result = data_1.replace(/<br>/g, '\\n');
                                res.end(result);

                            });
                    }
                } //if 닫음.

                else {
                    var data = fs.readFileSync("./data/" + "message.json", 'utf8'); // {
                    var messages = JSON.parse(data);

                    var tasks = [
                        function(callback) {
                            var real_context;
                            var sql = 'SELECT context FROM input WHERE user_key = \'' + req.body["user_key"] + ' \'';

                            connection.query(sql, function(err, row, fields) {
                                if (err) {
                                    console.log("db query error");
                                    console.log(err);
                                    return callback(err);
                                }
                                else {
                                    console.log("db connect");
                                    real_context = JSON.stringify(row);
                                    console.log('real_context' + real_context);
                                    //context, [ ]떼기
                                    var real_context2 = real_context.substring(12, real_context.length - 2);
                                    console.log("real_context2 : " + real_context2);

                                    callback(null, real_context2);
                                }

                            });
                        },
                        function(real_context3, callback) {

                            var real_context = real_context3.replace(/\\"/g, '\"');
                            real_context = real_context.substring(1, real_context.length - 1);
                            console.log("real_context3 : " + real_context);

                            callback(null, real_context);
                        },
                        function(real_context, callback) {
                            console.log(real_context);
                            var new_inputtxtinit = req.body["content"];
                            console.log("new_inputtxtinit :" + new_inputtxtinit);

                            var new_inputJsonObjectData = {
                                "story_id": story_id,
                                "context": real_context,
                                "input": {
                                    "text": new_inputtxtinit
                                }
                            };

                            callback(null, new_inputJsonObjectData);
                        },
                        function(new_inputJsonObjectData, callback) {
                            new_inputJsonObjectData = JSON.stringify(new_inputJsonObjectData);

                            var new_inputJsonObjectData2 = new_inputJsonObjectData.replace(/\\"/g, '\"');
                            new_inputJsonObjectData2 = new_inputJsonObjectData2.replace(/context":"/g, 'context\"\:');

                            var new_inputJsonObjectData3 = new_inputJsonObjectData2.replace(/}"/g, '\}');
                            console.log(new_inputJsonObjectData3);

                            callback(null, new_inputJsonObjectData3);
                        },
                        function(new_inputJsonObjectData, callback) {
                            console.log("new_new : " + new_inputJsonObjectData);
                            console.log("type new_input : " + typeof(new_inputJsonObjectData));
                            new_inputJsonObjectData = JSON.parse(new_inputJsonObjectData);
                            console.log("conversation :" + new_inputJsonObjectData["context"]["information"]["conversation_stack"][0]["conversation_node_name"]);

                            var visit_node = new_inputJsonObjectData["context"]["information"]["conversation_stack"][0]["conversation_node_name"];
                            var visitString = visit_node.toString();

                            if (visitString == "#불편사항") {
                                var sql = 'INSERT INTO complain(complain) VALUES(?)';
                                var params = [req.body["content"]];

                                connection.query(sql, params, function(err, row, fields) {
                                    if (err) {
                                        console.log("db query error:update");
                                        console.log(err);

                                    }
                                    else {
                                        console.log("db connect : update");
                                        console.log("row : " + row);
                                        console.log("fields :" + fields);
                                        //console.log(row_select);
                                    }

                                });
                                var new_inputtxtinit = req.body["content"];

                                var new_inputJsonObjectData = {
                                    "story_id": story_id,
                                    "context": {
                                        "variables": null,
                                        "conversation_id": req.body["user_key"],
                                        "reprompt": true,
                                        "message": null,
                                        "visit_counter": 0,
                                        "retrieve_field": false,
                                        "information": {
                                            "conversation_stack": [{
                                                "conversation_node_name": "#불편사항",
                                                "conversation_node": "87c52ab3-fa02-734f-b814-d77e81d75f58"
                                            }],
                                            "conversation_counter": 12,
                                            "user_request_counter": 12
                                        },
                                        "input_field": null,
                                        "random": false,
                                        "keyboard": null
                                    },
                                    "input": {
                                        "text": "불편사항완료"
                                    }
                                };

                            }
                            callback(null, new_inputJsonObjectData);

                        },
                        function(new_inputJsonObjectData, callback) {
                            //console.log("conversation :" + new_inputJsonObjectData["context"]["information"]["conversation_stack"][0]["conversation_node_name"]);

                            var visit_node = new_inputJsonObjectData["context"]["information"]["conversation_stack"][0]["conversation_node_name"];
                            var visitString = visit_node.toString();

                            if (visitString == "case_상품") {
                                var str = req.body["content"];
                                var encodedStr = qs.escape(str);
                                var url = 'http://www.minerud.com/goods/goods_search.php?keyword=' + encodedStr;
                                request(url, function(error, response, html) {
                                    if (error) {
                                        throw error
                                    };

                                    //console.log (html);  //전체 코드 console

                                    var $ = cheerio.load(html); //전체코드. 가로부분을 바꾸면 일부분 로드 가능.
                                    $(".search-page > strong").each(function(err) { //#옆에 원하는 데이터 넣기(ex색상)
                                        if (err) console.log(err);
                                        console.log("색상 : " + $(this).text()); //색상 데s이터만 출력
                                        var search_text = $(this).text().substr($(this).text().length - 7, 7);
                                        console.log("검색결과 : " + search_text);

                                        if (search_text == "검색결과 0개") {
                                            new_inputJsonObjectData["input"]["text"] = "아님";
                                        }
                                        else {
                                            new_inputJsonObjectData["input"]["text"] = "ok";
                                        }
                                    });

                                    $(".thumbnail > a").each(function(err) {
                                        if (err) console.log(err);
                                        console.log("url : " + $(this).attr('href'));
                                        var prod_url = $(this).attr('href').substring(3, $(this).attr('href').length);

                                        var sql = 'UPDATE input SET url =\'' + prod_url + ' \' WHERE user_key =\'' + req.body["user_key"] + ' \'';

                                        connection.query(sql, function(err, row, fields) {
                                            if (err) {
                                                console.log("db query error:prod_url");
                                                console.log(err);
                                                //console.log(row_select);

                                                return callback(err);
                                            }
                                            else {
                                                console.log("db connect: prod_url");
                                                console.log("row : " + row);
                                                console.log("fields :" + fields);
                                                // console.log(row_select);
                                            }
                                        });
                                        callback(null, new_inputJsonObjectData);
                                    });

                                });
                            }
                            else {
                                callback(null, new_inputJsonObjectData);
                            }

                        },
                        function(new_inputJsonObjectData, callback) {
                            //new_inputJsonObjectData = JSON.parse(new_inputJsonObjectData);

                            // request 보내기
                            var json = '';
                            request({
                                    url: url,
                                    method: 'POST',
                                    json: new_inputJsonObjectData
                                },
                                // response 받기, request의 콜백
                                function(error, response, body) {
                                    console.log(body);
                                    console.log("");
                                    json = body;
                                    // 받은 텍스트보기

                                    var outputTextArray = json["output"]["visit_nodes_text"];
                                    //console.log("outputTextArray: " + outputTextArray.toString());
                                    for (var i = 0; i < outputTextArray.length; i++) {
                                        //실행된 모든 노드의 대답을 표시한다
                                        console.log(outputTextArray[i]);
                                    }
                                    new_context = json['context'];
                                    if (outputTextArray[0].toString() == '') {
                                        messages["message"] = {
                                            "text": outputTextArray[1].toString()
                                        };
                                    }
                                    else {
                                        messages["message"] = {
                                            "text": outputTextArray[0].toString()
                                        };
                                    }
                                    //console.log(JSON.stringify(messages));

                                    callback(null, body);
                                });

                        },
                        function(body, callback) {
                            if (body["context"]["information"]["conversation_stack"][0]["conversation_node_name"].toString() == "@상품:사이즈") {
                                var sql_select = 'SELECT url FROM input WHERE user_key = \'' + req.body["user_key"] + ' \'';
                                var row_select;

                                connection.query(sql_select, function(err, row, fields) {
                                    if (err) {
                                        console.log("db query error");

                                        console.log(err);
                                        return callback(err);
                                    }
                                    else {
                                        //console.log("db connect");
                                        //console.log("row : " + JSON.stringify(row[0]));
                                        //console.log("fields :" + fields[0]);
                                        var row_str = JSON.stringify(row[0]);
                                        var str = row_str.substr(8, 40);
                                        var url = 'http://www.minerud.com/' + str;
                                        callback(null, url, body);
                                    }
                                });
                            }
                            else {
                                callback(null, url, body);
                            }

                        },
                        function(url, body, callback) {
                            console.log(url);
                            if (body["context"]["information"]["conversation_stack"][0]["conversation_node_name"].toString() == "@상품:사이즈") {
                                request(url, function(error, response, html) {
                                    if (error) {
                                        throw error;
                                    };

                                    //console.log (html);  //전체 코드 console
                                    console.log("사이즈 시작");

                                    var $ = cheerio.load(html); //전체코드. 가로부분을 바꾸면 일부분 로드 가능.
                                    $(".txt-manual").each(function(err) { //#옆에 원하는 데이터 넣기(ex색상)
                                        if (err) console.log(err);

                                        console.log($(this).text());

                                        console.log("사이즈:");
                                        var str = $(this).text();
                                        var n = str.search("SIZE");
                                        if (n == -1) {
                                            messages["message"] = {
                                                "text": 'free사이즈입니다.(꺄아)' + '<br>' + messages["message"]["text"]
                                            };
                                            callback(null, url, body);
                                        }
                                        else {
                                            var size = str.substring(n + 4, str.length - 1);
                                            //console.log(size);
                                            messages["message"] = {
                                                "text": 'SIZE<br>' + size + '<br>' + messages["message"]["text"]
                                            };
                                            callback(null, url, body);
                                        }

                                    });

                                });


                            }


                            else {
                                callback(null, url, body); //url == body;
                            }
                        },
                        function(url, body, callback) {
                            if (body["context"]["information"]["conversation_stack"][0]["conversation_node_name"].toString() == "@상품:색상") {
                                var sql_select = 'SELECT url FROM input WHERE user_key = \'' + req.body["user_key"] + ' \'';
                                var row_select;

                                connection.query(sql_select, function(err, row, fields) {
                                    if (err) {
                                        console.log("db query error");

                                        console.log(err);
                                        return callback(err);
                                    }
                                    else {
                                        //console.log("db connect");
                                        //console.log("row : " + JSON.stringify(row[0]));
                                        //console.log("fields :" + fields[0]);
                                        var row_str = JSON.stringify(row[0]);
                                        var str = row_str.substr(8, 40);
                                        var url = 'http://www.minerud.com/' + str;
                                        callback(null, url, body);
                                    }
                                });
                            }
                            else {
                                callback(null, url, body);
                            }

                        },
                        function(url, body, callback) {
                            console.log(url);
                            if (body["context"]["information"]["conversation_stack"][0]["conversation_node_name"].toString() == "@상품:색상") {
                                request(url, function(error, response, html) {
                                    if (error) {
                                        throw error;
                                    };


                                    var $ = cheerio.load(html); //전체코드. 가로부분을 바꾸면 일부분 로드 가능.

                                    $(".txt-manual").each(function(err) { //#옆에 원하는 데이터 넣기(ex색상)
                                        if (err) console.log(err);

                                        console.log($(this).text());

                                        var str = $(this).text();
                                        var n = str.search("COLOR");
                                        var color_1 = str.substring(n + 5, str.length);
                                        var end = color_1.search('POINT');
                                        var end_2 = color_1.search('SIZE');
                                        if (n == -1) {
                                            messages["message"] = {
                                                "text": 'COLOR<br>청록,화이트,그레이,블랙<br>' + messages["message"]["text"]
                                            };
                                            callback(null, url, body);
                                        }
                                        else {
                                            if (end == -1) {
                                                var color = color_1.substring(0, end_2);
                                                console.log(color);
                                                messages["message"] = {
                                                    "text": 'COLOR<br>' + color + '<br>' + messages["message"]["text"]
                                                };
                                                callback(null, url, body);
                                            }
                                            else {
                                                var color = color_1.substring(0, end);
                                                console.log(color);
                                                messages["message"] = {
                                                    "text": 'COLOR<br>' + color + '<br>' + messages["message"]["text"]
                                                };
                                                callback(null, url, body);
                                            }
                                        }


                                    });



                                });


                            }


                            else {
                                callback(null, url, body); //url == body;
                            }
                        },
                        function(url, body, callback) {
                            console.log("body conversation : " + body["context"]["information"]["conversation_stack"][0]["conversation_node_name"].toString());
                            if (body["context"]["information"]["conversation_stack"][0]["conversation_node_name"].toString() == "true<br>") {

                                var sql_shop = 'SELECT shop_name FROM request WHERE shop_name = \'' + req.body["content"] + ' \' ';
                                var row_shop;
                                //쇼핑몰 탐색
                                connection.query(sql_shop, function(err, row, fields) {
                                    if (err) {
                                        console.log("db query error");

                                        console.log(err);
                                        return callback(err);
                                    }
                                    else {
                                        console.log("db connect");
                                        console.log("row : " + JSON.stringify(row[0]));
                                        console.log("fields :" + fields[0]);
                                        callback(null, row[0], body);

                                    }
                                });
                            }
                            else {
                                callback(null, null, body);
                            }
                        },
                        function(data, body, callback) {
                            if (body["context"]["information"]["conversation_stack"][0]["conversation_node_name"].toString() == "true<br>") {
                                //이미 저장된 user -> update , 새로운 user -> insert
                                console.log("data : " + JSON.stringify(data));

                                if (JSON.stringify(data) == undefined) {

                                    var sql = 'INSERT INTO request VALUES(?,?)';
                                    var params = [req.body["content"], 1];

                                    connection.query(sql, params, function(err, row, fields) {
                                        if (err) {
                                            console.log("db query error:request");
                                            console.log(err);
                                            //console.log(row_select);

                                            return callback(err);
                                        }
                                        else {
                                            console.log("db connect: request");
                                            console.log("row : " + row);
                                            console.log("fields :" + fields);
                                            // console.log(row_select);
                                            messages["message"] = {
                                                "text": "문의하신 쇼핑몰이 아직 등록되어있지 않습니다.  빠른 시일 내에 추가하도록 하겠습니다!! (흑흑)"
                                            };
                                            callback(null);
                                        }
                                    });

                                }
                                else {
                                    var sql = 'UPDATE request set shop_count = shop_count+1 where shop_name = \'' + req.body["content"] + ' \' ';

                                    connection.query(sql, function(err, row, fields) {
                                        if (err) {
                                            console.log("db query error:request");
                                            console.log(err);
                                            //console.log(row_select);

                                            return callback(err);
                                        }
                                        else {
                                            console.log("db connect: request");
                                            console.log("row : " + row);
                                            console.log("fields :" + fields);
                                            // console.log(row_select);
                                            messages["message"] = {
                                                "text": "문의하신 쇼핑몰이 아직 등록되어있지 않습니다.  빠른 시일 내에 추가하도록 하겠습니다!! (흑흑)"
                                            };
                                            callback(null);
                                        }
                                    });

                                }
                            }
                            else {
                                callback(null);
                            }

                        }
                    ];
                    async.waterfall(tasks, function(err) {
                        if (err)
                            console.log(err);
                        else {
                            console.log('done');
                            fs.writeFileSync("./data/message.json", JSON.stringify(messages, null, '\t'), "utf8"); //{
                            //if (err) {
                            //console.log(err);
                            //}
                            //})
                            var data_1 = fs.readFileSync("./data/message.json", 'utf8'); //{
                            var result = data_1.replace(/<br>/g, '\\n');
                            console.log(typeof(data_1) + data_1);
                            console.log("result : " + result);

                            var sql = 'UPDATE input SET context = ? WHERE user_key = ?'
                            var params = [JSON.stringify(new_context), req.body["user_key"]];

                            connection.query(sql, params, function(err, row, fields) {
                                if (err) {
                                    console.log("db query error:update");
                                    console.log(err);

                                }
                                else {
                                    console.log("db connect : update");
                                    console.log("row : " + row);
                                    console.log("fields :" + fields);
                                    //console.log(row_select);
                                }

                            });
                            res.end(result);
                        }

                    });


                } //else 닫음.
            }) //app.post 닫음.
    } //module 닫음.
