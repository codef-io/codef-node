/**
 * 저축 은행 개인 거래내역
 *
 * @author 	: codef
 * @date 	: 2019-07-26 09:00:00
 * @version : 1.0.0
 */

var https = require("https");
var parse = require("url-parse");
var urlencode = require("urlencode");

// ========== HTTP 기본 함수 ==========
var httpSender = function(url, token, body) {
  console.log("========== httpSender ========== ");
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
    codefApiCallback
  );
  request.write(urlencode.encode(JSON.stringify(body)));
  request.end();
};
// ========== HTTP 함수  ==========

// ========== Toekn 재발급  ==========
var requestToken = function(url, client_id, client_secret) {
  console.log("========== requestToken ========== ");
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
    authTokenCallback
  );
  request.write("grant_type=client_credentials&scope=read");
  request.end();
};
// ========== Toekn 재발급  ==========

var codef_url = "https://development.codef.io";
var token_url = "https://oauth.codef.io/oauth/token";

// 저축 은행 개인 거래내역
var account_list_path = "/v1/kr/bank2/p/account/transaction-list";

// 기 발급된 토큰
var token = "";

// BodyData
var codef_api_body = {
  connectedId: "9LUm.uhVQbzaangazwI0tr", // 엔드유저의 은행/카드사 계정 등록 후 발급받은 커넥티드아이디 예시
  organization: "기관코드",
  bankName: "<저축은행 중앙회 모듈 필수: [서브도메인 명]>",
  account: "계좌번호",
  startDate: "조회시작일자",
  endDate: "조회종료일자",
  orderBy: "정렬기준",
  inquiryType: "조회구분"
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
    // 데이저 수신 완료
    console.log("authTokenCallback body = " + body);
    token = JSON.parse(body).access_token;
    if (response.statusCode == 200) {
      console.log("토큰발급 성공");
      console.log("token = " + token);

      // CODEF API 요청
      httpSender(codef_url + account_list_path, token, codef_api_body);
    } else {
      console.log("토큰발급 오류");
    }
  });
};

// CODEF API Callback
var codefApiCallback = function(response) {
  console.log("codefApiCallback Status: " + response.statusCode);
  console.log("codefApiCallback Headers: " + JSON.stringify(response.headers));

  var body = "";
  response.setEncoding("utf8");
  response.on("data", function(data) {
    body += data;
  });

  // end 이벤트가 감지되면 데이터 수신을 종료하고 내용을 출력한다
  response.on("end", function() {
    console.log("codefApiCallback body:" + urlencode.decode(body));

    // 데이저 수신 완료
    if (response.statusCode == 200) {
      console.log("정상처리");
    } else if (response.statusCode == 401) {
      requestToken(
        token_url,
        "CODEF로부터 발급받은 클라이언트 아이디",
        "CODEF로부터 발급받은 시크릿 키"
      );
    } else {
      console.log("API 요청 오류");
    }
  });
};

// CODEF API 요청
httpSender(codef_url + account_list_path, token, codef_api_body);
