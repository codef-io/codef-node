var http = require('http');

// CODEF Host
var codef = {
  host : '192.168.10.126',
  port : '10001',
  // 은행 법인 보유계좌 Task
  account_list_path : '/v1/kr/bank/b/account/list'
}

var oauth = {
  token_url : '192.168.10.126',
  token_port : '8888',
  token_path : '/oauth/token',
  // 기 발급된 토큰
  access_token : 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlX3R5cGUiOiIwIiwic2NvcGUiOlsicmVhZCJdLCJzZXJ2aWNlX25vIjoiOTk5OTk5OTk5OSIsImV4cCI6MTU2MjczNjUyNywiYXV0aG9yaXRpZXMiOlsiSU5TVVJBTkNFIiwiUFVCTElDIiwiQkFOSyIsIkVUQyIsIlNUT0NLIiwiQ0FSRCJdLCJqdGkiOiIyODBhNjVkOS02NjU1LTQ5MzYtODEwNS05MjUyYTk4MGRjMDgiLCJjbGllbnRfaWQiOiJjb2RlZl9tYXN0ZXIifQ.eFCEgxcntsEkjFORAWGSi6949UMOuCxVsm2wnYlDXqrHWXXwG7-XfKugsBNone_qRRGeKD3iv6f_TEcVMWyTz8aS0fRbE514LVz6PnzKbruyPNDA5Pk3ym8up9h4Ba1ix__Bvpu_TB0Y7Fikk9YHWHacJy4F_WOjr8xFP-q2egh763_LqVUzRakGQoLOTukduZ5zH5lfSO1Z9yx2cnDkY4VSM9DTbycSZuA2oQkMVpXJc0slEyWLw7WNX5E-ff3fL6ePfJvu7by_4KmgmmJkOoKBWvJ00DwrwhAa1EZmjqGPYG6RE6wxSwsu3lYeiCX-jSGm_cbKdk7YDnYxm8FKzg'
}

// CODEF API Callback
var codefApiCallback = function(response){
  console.log('Headers: ' + JSON.stringify(response.headers));
  console.log('Status: ' + response.statusCode);

  // response 이벤트가 감지되면 데이터를 body에 받아온다
  var body = '';
  response.setEncoding('utf8');
  response.on('data', function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on('end', function() {
    // 데이저 수신 완료
    console.log(body);

    if(response.statusCode == 401) {
      // CODEF API 요청
      var req = http.request({
        hostname: oauth.token_url,
        path: oauth.token_path,
        port : oauth.token_port,
        method: 'POST',
        headers: {
          'Acceppt': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (new Buffer('codef_master:codef_master_secret').toString('base64'))
        }
      }, authTokenCallback);
      req.write(
        'grant_type=client_credentials&scope=read'
      );
      req.end();
    } else {
      console.log('정상처리');
    }
  });
}

// Auth Token Callback
var authTokenCallback = function(response){
  console.log('Status: ' + response.statusCode);
  console.log('Headers: ' + JSON.stringify(response.headers));

  // response 이벤트가 감지되면 데이터를 body에 받아온다
  var body = '';
  response.setEncoding('utf8');
  response.on('data', function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on('end', function() {
    // 데이저 수신 완료
    console.log(body);
    oauth.access_token = JSON.parse(body).access_token;
    if(response.statusCode == 200) {
      console.log('토큰발급 성공')
      console.log('oauth.access_token = ' + oauth.access_token);

      // CODEF API 요청
      var req = http.request({
        hostname: codef.host,
        path: codef.account_list_path,
        port : codef.port,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + oauth.access_token
        }
      }, codefApiCallback);
      req.write(
        JSON.stringify(body)
      );
      req.end();
    } else {
      console.log('토큰발급 오류')
    }
  });
}

// CODEF API 요청
var req = http.request({
  hostname: codef.host,
  path: codef.account_list_path,
  port : codef.port,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + oauth.access_token
  }
}, codefApiCallback);
req.write(
  // setBodyData
  '{"connected_id":"9LUm.uhVQbzaangazwI0tr","organization":"0011"}'
);
req.end();
