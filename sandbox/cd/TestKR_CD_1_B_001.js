/**
 * 카드 법인 보유카드
 *
 * @author 	: codef
 * @date 	: 2019-07-26 09:00:00
 * @version : 1.0.0
 */

var https = require('https');
var parse = require('url-parse')
var urlencode = require('urlencode');

// ========== HTTP 기본 함수 ==========
var httpSender = function(url, token, body) {
  console.log('========== httpSender ========== ')
  var uri = parse(url, true);

  var request = https.request({
    hostname: uri.hostname,
    path: uri.pathname,
    port: uri.port,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }, codefApiCallback);
  request.write(urlencode.encode(JSON.stringify(body)));
  request.end();
}
// ========== HTTP 함수  ==========

// ========== Toekn 재발급  ==========
var requestToken = function(url, client_id, client_secret) {
  console.log('========== requestToken ========== ')
  var uri = parse(url)

  var authHeader = new Buffer(client_id + ':' + client_secret).toString('base64');

  var request = https.request({
    hostname: uri.hostname,
    path: uri.pathname,
    port: uri.port,
    method: 'POST',
    headers: {
      'Acceppt': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + authHeader
    }
  }, authTokenCallback);
  request.write('grant_type=client_credentials&scope=read');
  request.end();
}
// ========== Toekn 재발급  ==========

// API서버 샌드박스 도메인
var CODEF_URL = 'https://tsandbox.codef.io'
var TOKEN_URL = 'https://toauth.codef.io/oauth/token'
var SANDBOX_CLIENT_ID 	= "ef27cfaa-10c1-4470-adac-60ba476273f9";      // CODEF 샌드박스 클라이언트 아이디
var SANDBOX_SECERET_KEY 	= "83160c33-9045-4915-86d8-809473cdf5c3";    // CODEF 샌드박스 클라이언트 시크릿

// 카드 법인 보유카드
var card_list_path = '/v1/kr/card/b/account/card-list'

// 기 발급된 토큰
var token = ''

// BodyData
var codef_api_body = {
  "connectedId": 'sandbox_connectedId',     // SANDBOX 커넥티드아이디
  "organization": "0301",                   // 기관코드(https://developer.codef.io "은행 목록" 참조)
  "identity": "1138630000"
}

// Auth Token Callback
var authTokenCallback = function(response) {
  console.log('authTokenCallback Status: ' + response.statusCode);
  console.log('authTokenCallback Headers: ' + JSON.stringify(response.headers));

  var body = '';
  response.setEncoding('utf8');
  response.on('data', function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on('end', function() {
    // 데이저 수신 완료
    console.log('authTokenCallback body = ' + body);
    token = JSON.parse(body).access_token;
    if (response.statusCode == 200) {
      console.log('토큰발급 성공')
      console.log('token = ' + token);

      // CODEF API 요청
      httpSender(CODEF_URL + card_list_path, token, codef_api_body);
    } else {
      console.log('토큰발급 오류')
    }
  });
}

// CODEF API Callback
var codefApiCallback = function(response) {
  console.log('codefApiCallback Status: ' + response.statusCode);
  console.log('codefApiCallback Headers: ' + JSON.stringify(response.headers));

  var body = '';
  response.setEncoding('utf8');
  response.on('data', function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on('end', function() {
    console.log('codefApiCallback body:' + urlencode.decode(body));

    // 데이저 수신 완료
    if (response.statusCode == 200) {
      console.log('정상처리');
    } else if (response.statusCode == 401) {
      requestToken(TOKEN_URL, SANDBOX_CLIENT_ID, SANDBOX_SECERET_KEY);
    } else {
      console.log('API 요청 오류');
    }
  });
}

// CODEF API 요청
httpSender(CODEF_URL + card_list_path, token, codef_api_body);
