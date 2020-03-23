/**
 * 계정등록 API
 *
 * @author 	: codef
 * @date 	: 2019-07-26 09:00:00
 * @version : 1.0.0
 */

var https = require("https");
var parse = require("url-parse");
var urlencode = require("urlencode");
var crypto = require("crypto");
var constants = require("constants");

// ========== HTTP 기본 함수 ==========
var httpSender = function(url, token, body, callback) {
  var uri = parse(url, true);

  var request = https.request(
    {
      hostname: uri.hostname,
      path: uri.pathname,
      port: uri.port,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    },
    callback
  );
  request.write(urlencode.encode(JSON.stringify(body)));
  request.end();
};
// ========== HTTP 함수  ==========

// ========== Token 재발급  ==========
var requestToken = function(url, client_id, client_secret, callback) {
  var uri = parse(url);

  var authHeader = new Buffer(client_id + ":" + client_secret).toString(
    "base64"
  );

  var request = https.request(
    {
      hostname: uri.hostname,
      path: uri.pathname,
      port: uri.port,
      method: "POST",
      headers: {
        Acceppt: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + authHeader
      }
    },
    callback
  );
  request.write("grant_type=client_credentials&scope=read");
  request.end();
};
// ========== Token 재발급  ==========

// ========== public Encrypt  ==========
function publicEncRSA(publicKey, data) {
  var pubkeyStr =
    "-----BEGIN PUBLIC KEY-----\n" + publicKey + "\n-----END PUBLIC KEY-----";
  var bufferToEncrypt = new Buffer(data);
  var encryptedData = crypto
    .publicEncrypt(
      { key: pubkeyStr, padding: constants.RSA_PKCS1_PADDING },
      bufferToEncrypt
    )
    .toString("base64");

  console.log(encryptedData);

  return encryptedData;
}
// ========== public Encrypt  ==========

// token URL
token_url = "https://oauth.codef.io/oauth/token";

// CODEF 연결 아이디
connected_id = "";

// 기 발급된 토큰
token = "";

pubKey = "CODEF로부터 발급받은 publicKey";

//////////////////////////////////////////////////////////////////////////////
//                               계정 생성 Sample                             //
//////////////////////////////////////////////////////////////////////////////
// Input Param
//
// accountList : 계정목록
//   countryCode : 국가코드
//   businessType : 비즈니스 구분
//   clientType : 고객구분(P: 개인, B: 기업)
//   organization : 기관코드
//   loginType : 로그인타입 (0: 인증서, 1: ID/PW)
//   password : 인증서 비밀번호
//   derFile : 인증서 derFile
//   keyFile : 인증서 keyFile
//
//////////////////////////////////////////////////////////////////////////////
var codefAccountCreateUrl = "https://api.codef.io/v1/account/create";
var codefAccountCreateBody = {
  accountList: [
    {
      countryCode: "KR",
      businessType: "BK",
      clientType: "P",
      organization: "0004",
      loginType: "0",
      password: publicEncRSA(pubKey, "1234"), // 인증서 비밀번호 입력
      derFile: "MIIF...", // 인증서 인증서 DerFile
      keyFile: "MIIF..." // 인증서 인증서 KeyFile
    }
  ]
};

// Auth Token Callback
var authTokenCallback = function(response) {
  console.log("authTokenCallback Status: " + response.statusCode);
  console.log("authTokenCallback Headers: " + JSON.stringify(response.headers));

  var body = "";
  response.setEncoding("utf8");
  response.on("data", function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on("end", function() {
    // 데이터 수신 완료
    console.log("authTokenCallback body = " + body);
    token = JSON.parse(body).access_token;
    if (response.statusCode == 200) {
      console.log("토큰발급 성공");
      console.log("token = " + token);

      // CODEF API 요청
      httpSender(
        codefAccountCreateUrl,
        token,
        codefAccountCreateBody,
        codefAccountCreateCallback
      );
    } else {
      console.log("토큰발급 오류");
    }
  });
};

// CODEF API Callback
var codefAccountCreateCallback = function(response) {
  console.log("codefAccountCreateCallback Status: " + response.statusCode);
  console.log(
    "codefAccountCreateCallback Headers: " + JSON.stringify(response.headers)
  );

  var body = "";
  response.setEncoding("utf8");
  response.on("data", function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on("end", function() {
    console.log("codefAccountCreateCallback body:" + urlencode.decode(body));

    // 데이터 수신 완료
    if (response.statusCode == 401) {
      // reissue token
      requestToken(
        tokenUrl,
        "CODEF로부터 발급받은 클라이언트 아이디",
        "CODEF로부터 발급받은 시크릿 키",
        authTokenCallback
      );
    } else {
      var dict = JSON.parse(urlencode.decode(body));

      connectedId = dict.data.connectedId;
      console.log("connectedId = " + connectedId);
      console.log("계정생성 정상처리");
    }
  });
};

// CODEF API 요청
httpSender(
  codefAccountCreateUrl,
  token,
  codefAccountCreateBody,
  codefAccountCreateCallback
);

//////////////////////////////////////////////////////////////////////////////
//                               계정 추가 Sample                             //
//////////////////////////////////////////////////////////////////////////////
// Input Param
//
// connectedId : CODEF 연결아이디
// accountList : 계정목록
//   countryCode : 국가코드
//   businessType : 비즈니스 구분
//   clientType : 고객구분(P: 개인, B: 기업)
//   organization : 기관코드
//   loginType : 로그인타입 (0: 인증서, 1: ID/PW)
//   password : 인증서 비밀번호
//   derFile : 인증서 derFile
//   keyFile : 인증서 keyFile
//
//////////////////////////////////////////////////////////////////////////////
var codefAccountAddUrl = "https://api.codef.io/v1/account/add";
var codefAccountAddBody = {
  connectedId: "8-cXc.6lk-ib4Whi5zClVt", // connected_id
  accountList: [
    {
      countryCode: "KR",
      businessType: "BK",
      clientType: "P",
      organization: "0020",
      loginType: "0",
      password: publicEncRSA(pubKey, "1234"), // 인증서 비밀번호 입력
      derFile: "MIIF...", // 인증서 인증서 DerFile
      keyFile: "MIIF..." // 인증서 인증서 KeyFile
    }
  ]
};

// Auth Token Callback
var authTokenCallback = function(response) {
  console.log("authTokenCallback Status: " + response.statusCode);
  console.log("authTokenCallback Headers: " + JSON.stringify(response.headers));

  var body = "";
  response.setEncoding("utf8");
  response.on("data", function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on("end", function() {
    // 데이터 수신 완료
    console.log("authTokenCallback body = " + body);
    token = JSON.parse(body).access_token;
    if (response.statusCode == 200) {
      console.log("토큰발급 성공");
      console.log("token = " + token);

      // CODEF API 요청
      httpSender(
        codefAccountAddUrl,
        token,
        codefAccountAddBody,
        codefAccountAddCallback
      );
    } else {
      console.log("토큰발급 오류");
    }
  });
};

// CODEF API Callback
var codefAccountAddCallback = function(response) {
  console.log("codefAccountAddCallback Status: " + response.statusCode);
  console.log(
    "codefAccountAddCallback Headers: " + JSON.stringify(response.headers)
  );

  var body = "";
  response.setEncoding("utf8");
  response.on("data", function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on("end", function() {
    console.log("codefAccountAddCallback body:" + urlencode.decode(body));

    // 데이터 수신 완료
    if (response.statusCode == 401) {
      // reissue token
      requestToken(
        tokenUrl,
        "CODEF로부터 발급받은 클라이언트 아이디",
        "CODEF로부터 발급받은 시크릿 키",
        authTokenCallback
      );
    } else {
      var dict = JSON.parse(urlencode.decode(body));
      console.log("계정추가 정상처리");
    }
  });
};

// CODEF API 요청
httpSender(
  codefAccountAddUrl,
  token,
  codefAccountAddBody,
  codefAccountAddCallback
);

//////////////////////////////////////////////////////////////////////////////
//                               계정 수정 Sample                             //
//////////////////////////////////////////////////////////////////////////////
// Input Param
//
// connectedId : CODEF 연결아이디
// accountList : 계정목록
//   countryCode : 국가코드
//   businessType : 비즈니스 구분
//   clientType : 고객구분(P: 개인, B: 기업)
//   organization : 기관코드
//   loginType : 로그인타입 (0: 인증서, 1: ID/PW)
//   password : 인증서 비밀번호
//   derFile : 인증서 derFile
//   keyFile : 인증서 keyFile
//
//////////////////////////////////////////////////////////////////////////////
var codefAccountUpdateUrl = "https://api.codef.io/v1/account/update";
var codefAccountUpdateBody = {
  connectedId: "8-cXc.6lk-ib4Whi5zClVt", // connected_id
  accountList: [
    {
      countryCode: "KR",
      businessType: "BK",
      clientType: "P",
      organization: "0020",
      password: publicEncRSA(pubKey, "1234"), // 인증서 비밀번호 입력
      derFile: "MIIF...", // 인증서 인증서 DerFile
      keyFile: "MIIF..." // 인증서 인증서 KeyFile
    }
  ]
};

// Auth Token Callback
var authTokenCallback = function(response) {
  console.log("authTokenCallback Status: " + response.statusCode);
  console.log("authTokenCallback Headers: " + JSON.stringify(response.headers));

  var body = "";
  response.setEncoding("utf8");
  response.on("data", function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on("end", function() {
    // 데이터 수신 완료
    console.log("authTokenCallback body = " + body);
    token = JSON.parse(body).access_token;
    if (response.statusCode == 200) {
      console.log("토큰발급 성공");
      console.log("token = " + token);

      // CODEF API 요청
      httpSender(
        codefAccountUpdateUrl,
        token,
        codefAccountUpdateBody,
        codefAccountUpdateCallback
      );
    } else {
      console.log("토큰발급 오류");
    }
  });
};

// CODEF API Callback
var codefAccountUpdateCallback = function(response) {
  console.log("codefAccountUpdateCallback Status: " + response.statusCode);
  console.log(
    "codefAccountUpdateCallback Headers: " + JSON.stringify(response.headers)
  );

  var body = "";
  response.setEncoding("utf8");
  response.on("data", function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on("end", function() {
    console.log("codefAccountUpdateCallback body:" + urlencode.decode(body));

    // 데이터 수신 완료
    if (response.statusCode == 401) {
      // reissue token
      requestToken(
        tokenUrl,
        "CODEF로부터 발급받은 클라이언트 아이디",
        "CODEF로부터 발급받은 시크릿 키",
        authTokenCallback
      );
    } else {
      var dict = JSON.parse(urlencode.decode(body));

      connectedId = dict.data.connectedId;
      console.log("connectedId = " + connectedId);
      console.log("계정수정 정상처리");
    }
  });
};

// CODEF API 요청
httpSender(
  codefAccountUpdateUrl,
  token,
  codefAccountUpdateBody,
  codefAccountUpdateCallback
);

//////////////////////////////////////////////////////////////////////////////
//                               계정 삭제 Sample                             //
//////////////////////////////////////////////////////////////////////////////
// Input Param
//
// connectedId : CODEF 연결아이디
// accountList : 계정목록
//   countryCode : 국가코드
//   businessType : 비즈니스 구분
//   clientType : 고객구분(P: 개인, B: 기업)
//   organization : 기관코드
//   loginType : 로그인타입 (0: 인증서, 1: ID/PW)
//   password : 인증서 비밀번호
//   derFile : 인증서 derFile
//   keyFile : 인증서 keyFile
//
//////////////////////////////////////////////////////////////////////////////
var codefAccountDeleteUrl = "https://api.codef.io/v1/account/delete";
var codefAccountDeleteBody = {
  connectedId: "8-cXc.6lk-ib4Whi5zClVt", // connected_id
  accountList: [
    {
      countryCode: "KR",
      businessType: "BK",
      clientType: "P",
      organization: "0020",
      loginType: "0"
    }
  ]
};

// Auth Token Callback
var authTokenCallback = function(response) {
  console.log("authTokenCallback Status: " + response.statusCode);
  console.log("authTokenCallback Headers: " + JSON.stringify(response.headers));

  var body = "";
  response.setEncoding("utf8");
  response.on("data", function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on("end", function() {
    // 데이터 수신 완료
    console.log("authTokenCallback body = " + body);
    token = JSON.parse(body).access_token;
    if (response.statusCode == 200) {
      console.log("토큰발급 성공");
      console.log("token = " + token);

      // CODEF API 요청
      httpSender(
        codefAccountDeleteUrl,
        token,
        codefAccountDeleteBody,
        codefAccountDeleteCallback
      );
    } else {
      console.log("토큰발급 오류");
    }
  });
};

// CODEF API Callback
var codefAccountDeleteCallback = function(response) {
  console.log("codefAccountDeleteCallback Status: " + response.statusCode);
  console.log(
    "codefAccountDeleteCallback Headers: " + JSON.stringify(response.headers)
  );

  var body = "";
  response.setEncoding("utf8");
  response.on("data", function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on("end", function() {
    console.log("codefAccountDeleteCallback body:" + urlencode.decode(body));

    // 데이터 수신 완료
    if (response.statusCode == 401) {
      // reissue token
      requestToken(
        tokenUrl,
        "CODEF로부터 발급받은 클라이언트 아이디",
        "CODEF로부터 발급받은 시크릿 키",
        authTokenCallback
      );
    } else {
      var dict = JSON.parse(urlencode.decode(body));

      connectedId = dict.data.connectedId;
      console.log("connectedId = " + connectedId);
      console.log("계정삭제 정상처리");
    }
  });
};

// CODEF API 요청
httpSender(
  codefAccountDeleteUrl,
  token,
  codefAccountDeleteBody,
  codefAccountDeleteCallback
);
