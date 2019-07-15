# CODEF API - Node
Node sample for CODEF API

## Documentation

본 샘플은 CODEF API의 연동을 위한 공통 코드를 포함하고 있으며, 지원하는 모든 API의 엔드포인트(은행, 카드, 보험, 증권, 공공, 기타)는
https://develpers.codef.io 를 통해 확인할 수 있습니다.

## CODEF API Env

CODEF API는 원활한 개발을 위해 샌드박스, 개발, 운영 환경을 각각 제공한다.

- 샌드박스 : https://sandbox.codef.io
- 개발 : https://development.codef.io
- 운영 : https://api.codef.io

## Getting Started


### OAuth2.0

CODEF API를 사용하기 위해서는 'access_token' 발행이 선행되어야 하며, 거래 시 Header 에 포함하여 요청합니다.
'access_token'을 발급 받기 위한 'client_id' 및 'client_secret'은 https://codef.io/#/account/keys 에서 확인할 수 있습니다.

```javascript
var tokenUrl = 'https://api.codef.io/oauth/token'
requestToken(tokenUrl, 'codef_master', 'codef_master_secret', authTokenCallback);

var requestToken = function(url, client_id, client_secret, callback) {
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
  }, callback);
  request.write('grant_type=client_credentials&scope=read');
  request.end();
}

```
```json
{"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlX3R5cGUiOiIwIiwic2NvcGUiOlsicmVhZCJdLCJzZXJ2aWNlX25vIjoiMDAwMDAwMDQyMDAxIiwiZXhwIjoxNTYyNjc0NTczLCJhdXRob3JpdGllcyI6WyJJTlNVUkFOQ0UiLCJQVUJMSUMiLCJCQU5LIiwiRVRDIiwiU1RPQ0siLCJDQVJEIl0sImp0aSI6ImFiNTBjM2RmLWQ3MzctNGE2Ny04Zjg4LWQzOTE2YTNiYmNiMSIsImNsaWVudF9pZCI6ImNvZGVmX21hc3RlciJ9.EXBV-D89_zoYmFdiULahGqcp1T2Du8DM51Trf1fD4MxsKYsA1t37ovffIKIQvqLHwQz4W8EqC6s8lM1V_IqFG5D5yafmyvprVi7ciqRMBBIsnEZN8xk1gBqLydtwkG0jKTrCLTBls8zATHbWV8BO6oUw8fwQId4ExeewbqeflSBCLOztb4c8UkR1WFDqQs63Ezry8k79VN5HPSktChJGnGq0xWmtbMlwv8IubvveJkMLz-6Iw6hlSMjeat_fv-gZCPTPdoaMa-BPxcAhI772cSCrfJNzori0uVFIeBEInabDzAKpXjvbsZEz_q70QGGSPkoslxFb_N-MYSNPgCWEvw","token_type":"bearer","expires_in":9,"scope":"read"}
```


### 계정 생성

CODEF API를 사용하기 위해서는 엔드유저가 사용하는 대상기관의 인증수단 등록이 필요하며, 이를 통해 사용자마다 유니크한 'connected_id'를 발급받을 수 있습니다.
이후에는 별도의 인증수단 전송 없이 'connected_id'를 통해서 대상기관의 데이터를 연동할 수 있습니다.

```javascript
codef_account_create_url = 'https://api.codef.io/v1/account/create'
codef_account_create_body = {
            'accountList':[                    # 계정목록
                {
                    'organization':'0003',     # 기관코드
                    'loginType':'0',           # 로그인타입 (0: 인증서, 1: ID/PW)
                    'password':'1234',         # 인증서 비밀번호             
                    'derFile':'인증서 DerFile',  # Base64String
                    'keyFile':'인증서 KeyFile'   # Base64String
                }
            ]
}

# CODEF API 호출
httpSender(codef_account_create_url, token, codef_account_create_body, callback)
response.on('end', function() {
  // 데이저 수신 완료
  if(response.statusCode == 401) {
    // reissue token
    requestToken(tokenUrl, 'codef_master', 'codef_master_secret', authTokenCallback);
  } else {
    var dict = JSON.parse(urlencode.decode(body))

    connectedId = dict.data.connectedId;
    console.log('connectedId = ' + connectedId);
    console.log('계정생성 정상처리');
  }
});
```
```json
{"result":{"code":"CF-00000","extraMessage":"","message":"정상"},"data":{"organizationList":[{"loginType":"0","organization":"0003"}],"connectedId":"1rZjLWFDQTAbWI-9weTq03"}}
```


### 계정 추가

계정 생성을 통해 발급받은 'connected_id'에 추가 기관의 인증수단을 등록할 수 있습니다. 추가 등록한 기관을 포함하여 이후에는 별도의 인증수단 전송없이
'connected_id'를 통해서 대상기관의 데이터를 연동할 수 있습니다.

```javascript
codef_account_create_url = 'https://api.codef.io/v1/account/add'
codef_account_create_body = {
            'accountList':[                    # 계정목록
                {
                    'organization':'0003',     # 기관코드
                    'loginType':'0',           # 로그인타입 (0: 인증서, 1: ID/PW)
                    'password':'1234',         # 인증서 비밀번호             
                    'derFile':'인증서 DerFile',  # Base64String
                    'keyFile':'인증서 KeyFile'   # Base64String
                }
            ]
}

# CODEF API 호출
httpSender(codef_account_add_url, token, codef_account_add_body, callback)
response.on('end', function() {
  // 데이저 수신 완료
  if(response.statusCode == 401) {
    // reissue token
    requestToken(tokenUrl, 'codef_master', 'codef_master_secret', authTokenCallback);
  } else {
    var dict = JSON.parse(urlencode.decode(body))

    connectedId = dict.data.connectedId;
    console.log('connectedId = ' + connectedId);
    console.log('계정추가 정상처리');
  }
});
```
```json
{"result":{"code":"CF-94004","extraMessage":"","message":"이미 계정이 등록된 기관입니다. 기존 계정 먼저 삭제하세요."},"data":{"organizationList":[{"loginType":"0","organization":"0003"}],"connectedId":"1rZjLWFDQTAbWI-9weTq03"}}
```


### 계정 수정

계정 생성을 통해 발급받은 'connected_id'에 등록된 기관의 인증수단을 변경할 수 있습니다. 변경 요청한 기관의 인증 수단은 호출 즉시 변경되며, 이 후
'connected_id'를 통해서 대상기관의 데이터를 연동할 수 있습니다.

```javascript
codef_account_update_url = 'https://api.codef.io/v1/account/update'
codef_account_update_body = {
            'connectedId': '계정생성 시 발급받은 아이디',    # connected_id
            'accountList':[                    # 계정목록
                {
                    'organization':'0003',     # 기관코드
                    'loginType':'0',           # 로그인타입 (0: 인증서, 1: ID/PW)
                    'password':'1234',         # 인증서 비밀번호             
                    'derFile':'인증서 DerFile',  # Base64String
                    'keyFile':'인증서 KeyFile'   # Base64String
                }
            ]
}

# CODEF API 호출
httpSender(codef_account_update_url, token, codef_account_update_body,callback)
response.on('end', function() {
  // 데이저 수신 완료
  if(response.statusCode == 401) {
    // reissue token
    requestToken(tokenUrl, 'codef_master', 'codef_master_secret', authTokenCallback);
  } else {
    var dict = JSON.parse(urlencode.decode(body))

    connectedId = dict.data.connectedId;
    console.log('connectedId = ' + connectedId);
    console.log('계정수정 정상처리');
  }
});
```
```json
{"result":{"code":"CF-00000","extraMessage":"","message":"정상"},"data":{"organizationList":[{"loginType":"0","organization":"0003"}],"connectedId":"8-cXc.6lk-ib4Whi5zClVt"}}
```


### 계정 삭제

엔드유저가 등록된 계정의 삭제를 요청 시 'connected_id'에 등록된 기관의 인증수단을 즉시 삭제할 수 있습니다. 요청한 기관의 인증 수단은 호출 즉시 삭제되며,
해당 데이터는 복구할 수 없습니다.

```javascript
codef_account_delete_url = 'https://api.codef.io/v1/account/delete'
codef_account_delete_body = {
            'connectedId': '계정생성 시 발급받은 아이디',    # connected_id
            'accountList':[                    # 계정목록
                {
                    'organization':'0003',     # 기관코드
                    'loginType':'0',           # 로그인타입 (0: 인증서, 1: ID/PW)
                    'password':'1234',         # 인증서 비밀번호             
                    'derFile':'인증서 DerFile',  # Base64String
                    'keyFile':'인증서 KeyFile'   # Base64String
                }
            ]
}

# CODEF API 호출
httpSender(codef_account_delete_url, token, codef_account_delete_body, callback)
response.on('end', function() {
  // 데이저 수신 완료
  if(response.statusCode == 401) {
    // reissue token
    requestToken(tokenUrl, 'codef_master', 'codef_master_secret', authTokenCallback);
  } else {
    var dict = JSON.parse(urlencode.decode(body))

    connectedId = dict.data.connectedId;
    console.log('connectedId = ' + connectedId);
    console.log('계정삭제 정상처리');
  }
});
```
```json
{"result":{"code":"CF-00000","extraMessage":"","message":"정상"},"data":{"organizationList":[{"loginType":"0","organization":"0003"}],"connectedId":"8-cXc.6lk-ib4Whi5zClVt"}}
```


### CODEF API(법인 보유계좌조회)

발급받은 'connected_id' 를 통해 등록된 기관의 보유계좌를 조회할 수 있습니다.

TestKR_BK_1_B_001.js
```javascript
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
```
```json
{"result":{"code":"CF-94002","extraMessage":"","message":"사용자+계정정보+설정에+실패했습니다."},"data":{}}
```


### 오류

CODEF API 오류는 HTTP status code 와 CODEF API ErrorCode로 분류합니다.

HTTP 401 - OAuth2.0 토큰 만료
```json
{"error":"invalid_token","error_description":"Cannot convert access token to JSON","code":"CF-99997","message":"OAUTH2.0 토큰 에러입니다. 메시지를 확인하세요."}
```

그 외 오류 HTTP 200 - CODEF 오류 변환(CF-XXXXX)
```json
{"result":{"code":"CF-94002","extraMessage":"","message":"사용자 계정정보 설정에 실패했습니다."},"data":{}}
```


## Change Log

CODEF API의 변경내을 [CHANGELOG.md](CHANGELOG.md) 을 통해 확인할 수 있습니다.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
