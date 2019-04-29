var uuid = require('node-uuid');
var logger = require('../log/logger').getLogger('main');

var cookieService = module.exports;

cookieService.create = (userType, userId) => {
  var ckAscii;

  // 标准格式:
  // UserType={userType}&&UserId={userId}&&Random={key}
  ckAscii = "UserType=" + userType + "&&UserId=" + userId + "&&Random=" + uuid.v4();

  return Buffer.from(ckAscii).toString('base64');
};

cookieService.decode = (ckEnc) => {
  var ckDec = {};

  // 标准格式:
  // UserType={userType}&&UserId={userId}&&Random={key}
  var ckAscii = Buffer.from(ckEnc, 'base64').toString('ascii');

  var andArray = ckAscii.split('&&');
  if (andArray.length != 3) {
    logger.error("ckAscii && error, ckAscii = %s", ckAscii);
    return false;
  }

  var userType = andArray[0].split('=');
  if (userType.length != 2 || userType[0] !== "UserType") {
    logger.error("ckAscii userType error, ckAscii = %s", ckAscii);
    return false;
  }

  var userId = andArray[1].split('=');
  if (userId.length != 2 || userId[0] !== "UserId") {
    logger.error("ckAscii userId error, ckAscii = %s", ckAscii);
    return false;
  }

  var random = andArray[2].split('=');
  if (random.length != 2 || random[0] !== "Random") {
    logger.error("ckAscii random error, ckAscii = %s", ckAscii);
    return false;
  }

  ckDec.src = ckEnc;
  ckDec.userType = userType[1];
  ckDec.userId = userId[1];
  ckDec.random = random[1];

  return ckDec;
};