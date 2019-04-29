var ws = require("nodejs-websocket")
var app = require('../application');
var constx = require('../util/constx');
var adminHandler = require('./adminHandler');
var patientHandler = require('./patientHandler');
var doctorHandler = require('./doctorHandler');
var response = require('../util/response');
var cookieService = require('./cookieService');
var logger = require('../log/logger').getLogger('main');

var webService = module.exports;
var handler = {};

webService.start = () => {
  if (app['enable'].indexOf(constx.MODULE_TYPE.admin) !== -1) {
    logger.info("webService enable admin module now");
    handler[constx.USER_TYPE.admin] = adminHandler.getHandler();
  }

  if (app['enable'].indexOf(constx.MODULE_TYPE.patient) !== -1) {
    logger.info("webService enable patient module now");
    handler[constx.USER_TYPE.patient] = patientHandler.getHandler();
  }

  if (app['enable'].indexOf(constx.MODULE_TYPE.doctor) !== -1) {
    logger.info("webService enable doctor module now");
    handler[constx.USER_TYPE.doctor] = doctorHandler.getHandler();
  }

  ws.createServer((conn) => {
    logger.info("New connection");

    conn.on("text", (msg) => {
      logger.info("Received msg = %s", msg);

      var req = {};
      req.conn = conn;

      try {
        req.msg = JSON.parse(msg);

      } catch (e) {
        logger.error("req msg to json error, msg = %s", msg);
        return conn.sendText(response.getStr(req, 401));
      }

      if (!req.msg.hasOwnProperty('Action')) {
        logger.error("req action not found");
        req.paraName = 'Action';
        return conn.sendText(response.getStr(req, 403));
      }

      req.action = req.msg.Action;
      req.userType = _getUserType(req);

      if (req.userType === false) {
        logger.error("req userType unknown");
        return conn.sendText(response.getStr(req, req.code));;
      }

      if (!handler[req.userType] || !handler[req.userType][req.action]) {
        logger.error("userType not supportted or action not supportted");
        return conn.sendText(response.getStr(req, 402));
      }

      handler[req.userType][req.action](req);
    });

    conn.on("close", (code, reason) => {
      logger.info("Connection closed");
    });

    conn.on("error", (code, reason) => {
      logger.info("Connection error");
    });

  }).listen(app['listenPort']);
};

function _getUserType(req) {
  // 注册用户的操作，而且要注册的用户类型是门诊用户，则判定请求用户为门诊用户
  if (req.action === constx.ACTION.registerUser && req.msg.Type === constx.USER_TYPE.patient) {
    return constx.USER_TYPE.patient;
  }

  // 登录操作，返回Type字段的值
  if (req.action === constx.ACTION.logIn &&
    (req.msg.Type === constx.USER_TYPE.admin ||
      req.msg.Type === constx.USER_TYPE.patient ||
      req.msg.Type === constx.USER_TYPE.doctor)) {
    return req.msg.Type;
  }

  // 登录操作，Type字段非法
  if (req.action === constx.ACTION.logIn) {
    logger.error("_getUserType LogIn Type error");

    req.code = 404;
    req.paraName = 'Type';
    req.paraVal = req.msg.Type;
    return false;
  }

  // 其他操作基于cookie来识别用户类型
  var cookie = req.msg.Cookie;
  if (cookie === undefined) {
    logger.error("_getUserType Cookie not found");

    req.code = 403;
    req.paraName = 'Cookie';
    return false;
  }

  var ckDec = cookieService.decode(cookie);
  if (ckDec === false) {
    logger.error("_getUserType Cookie error");

    req.code = 404;
    req.paraName = 'Cookie';
    req.paraVal = cookie;
    return false;
  }

  return ckDec.userType;
}