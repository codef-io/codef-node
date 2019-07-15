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
    port : uri.port,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  }, codefApiCallback);
  request.write(JSON.stringify(body));
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
    port : uri.port,
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


var codef_url = 'https://tapi.codef.io'
var token_url = 'https://toauth.codef.io/oauth/token'

// 은행 법인 보유계좌
var account_list_path = '/v1/kr/bank/b/account/account-list'

// 기 발급된 토큰
var token ='eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlX3R5cGUiOiIwIiwic2NvcGUiOlsicmVhZCJdLCJzZXJ2aWNlX25vIjoiOTk5OTk5OTk5OSIsImV4cCI6MTU2MjczNjUyNywiYXV0aG9yaXRpZXMiOlsiSU5TVVJBTkNFIiwiUFVCTElDIiwiQkFOSyIsIkVUQyIsIlNUT0NLIiwiQ0FSRCJdLCJqdGkiOiIyODBhNjVkOS02NjU1LTQ5MzYtODEwNS05MjUyYTk4MGRjMDgiLCJjbGllbnRfaWQiOiJjb2RlZl9tYXN0ZXIifQ.eFCEgxcntsEkjFORAWGSi6949UMOuCxVsm2wnYlDXqrHWXXwG7-XfKugsBNone_qRRGeKD3iv6f_TEcVMWyTz8aS0fRbE514LVz6PnzKbruyPNDA5Pk3ym8up9h4Ba1ix__Bvpu_TB0Y7Fikk9YHWHacJy4F_WOjr8xFP-q2egh763_LqVUzRakGQoLOTukduZ5zH5lfSO1Z9yx2cnDkY4VSM9DTbycSZuA2oQkMVpXJc0slEyWLw7WNX5E-ff3fL6ePfJvu7by_4KmgmmJkOoKBWvJ00DwrwhAa1EZmjqGPYG6RE6wxSwsu3lYeiCX-jSGm_cbKdk7YDnYxm8FKzg'

// BodyData
var codef_api_body = {
  "connected_id":"9LUm.uhVQbzaangazwI0tr",
  "organization":"0011"
}

// Auth Token Callback
var authTokenCallback = function(response){
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
    if(response.statusCode == 200) {
      console.log('토큰발급 성공')
      console.log('token = ' + token);

      // CODEF API 요청
      httpSender(codef_url + account_list_path, token, codef_api_body);
    } else {
      console.log('토큰발급 오류')
    }
  });
}

// CODEF API Callback
var codefApiCallback = function(response){
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
    if(response.statusCode == 200) {
      console.log('정상처리');
    } else if(response.statusCode == 401) {
      requestToken(token_url, 'codef_master', 'codef_master_secret');
    } else {
      console.log('API 요청 오류');
    }
  });
}

// CODEF API 요청
httpSender(codef_url + account_list_path, token, codef_api_body);
