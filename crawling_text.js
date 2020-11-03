var cheerio = require('cheerio');
var request = require('request');
var qs = require('querystring');

//url주소에서 goodsNo 부분을 사용자가 입력한 상품으로 검색하게끔 바꿔야함.
//var url = 'http://www.minerud.com/goods/goods_search.php?keyword=%ED%81%AC%EB%9F%B0%EC%B9%98+%EB%82%98%EC%8B%9C%ED%83%91&recentCount=10';
var str = '크런치 나시탑';
var encodedStr = qs.escape(str);
var url = 'http://www.minerud.com/goods/goods_view.php?goodsNo=1000000047';
request(url, function(error, response, html) {
  if (error) {
    throw error;
  };


  var $ = cheerio.load(html); //전체코드. 가로부분을 바꾸면 일부분 로드 가능.
 
  $("div[id~='delivery'] > .admin-msg").each(function(err) { //#옆에 원하는 데이터 넣기(ex색상)
    if (err) console.log(err);
   
    console.log($(this).text());
    
    var str = $(this).text();
    var n = str.search("COLOR");
    var color_1 = str.substring(n+5,str.length);
    var end = color_1.search('POINT');
    var end_2 = color_1.search('SIZE');
    if(end == -1){
    var color = color_1.substring(0,end_2);
    console.log(color);
    }
    else {
      var color = color_1.substring(0,end);
      console.log(color);
    }
  
    
  });
  
  
  
});