var async = require('async');
var constx = require('../util/constx');
var stringx = require('../util/stringx');
var response = require('../util/response');
var redisService = require('../dao/redisService');
var cookieService = require('./cookieService');
var userDao = require('../dao/userDao');
var logger = require('../log/logger').getLogger('main');

var patientHandler = module.exports;
var handler = {};

patientHandler.getHandler = () => {
  handler[constx.ACTION.registerUser] = registerUser;
  handler[constx.ACTION.getUser] = patientHandler.getUser;
  handler[constx.ACTION.editUser] = editUser;
  handler[constx.ACTION.logIn] = logIn;
  handler[constx.ACTION.logOut] = logOut;
  handler[constx.ACTION.getDepartment] = getDepartment;
  handler[constx.ACTION.listDepartment] = listDepartment;
  handler[constx.ACTION.listSchedule] = listSchedule;
  handler[constx.ACTION.getGuide] = getGuide;
  handler[constx.ACTION.addRegistration] = addRegistration;
  handler[constx.ACTION.removeRegistration] = removeRegistration;
  handler[constx.ACTION.editRegistration] = editRegistration;
  handler[constx.ACTION.listRegistration] = listRegistration;
  handler[constx.ACTION.listPrescription] = listPrescription;
  handler[constx.ACTION.onlinePay] = onlinePay;

  return handler;
};

function registerUser(req) {
  if (!req.msg.hasOwnProperty('Name')) {
    logger.error("req para Name not found");
    req.paraName = 'Name';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!stringx.validate64(req.msg.Name)) {
    logger.error("req paraVal Name error");
    req.paraName = 'Name';
    req.paraVal = req.msg.Name;
    return req.conn.sendText(response.getStr(req, 404));
  }

  if (!req.msg.hasOwnProperty('PassWord')) {
    logger.error("req para PassWord not found");
    req.paraName = 'PassWord';
    return req.conn.sendText(response.getStr(req, 403));
  }

  // 客户端传输过来的密码要经过base64编码，不能明文传输
  var pwAscii = Buffer.from(req.msg.PassWord, 'base64').toString('ascii');
  if (!stringx.validate64(pwAscii)) {
    logger.error("req paraVal PassWord error");
    req.paraName = 'PassWord';
    req.paraVal = req.msg.PassWord;
    return req.conn.sendText(response.getStr(req, 404));
  }

  if (!req.msg.hasOwnProperty('RealName')) {
    logger.error("req para RealName not found");
    req.paraName = 'RealName';
    return req.conn.sendText(response.getStr(req, 403));
  }

  async.waterfall([
    (func) => {
      userDao.getByName(req.msg.Name, func);

    }, (res, func) => {
      if (!!res) {
        logger.error("req Name already exists");
        req.resource = req.msg.Name;
        return req.conn.sendText(response.getStr(req, 405));
      }

      var user = {};
      user.name = req.msg.Name;
      user.password = req.msg.PassWord;
      user.type = req.msg.Type;
      user.realName = req.msg.RealName;
      user.description = "";
      user.cardNumber = "";

      userDao.add(user, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("registerUser internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("registerUser success");
      return req.conn.sendText(response.getStr(req, 200));
    }
  });
}

patientHandler.getUser = (req) => {
  async.waterfall([
    (func) => {
      var ckDec = cookieService.decode(req.msg.Cookie);
      req.msg.UserId = ckDec.userId;
      var key = constx.PREFIX.cookieCache + ckDec.userId;
      redisService.getKey(key, func);

    }, (cookie, func) => {
      if (cookie !== req.msg.Cookie) {
        logger.error("req para Cookie wrong or expired");
        req.paraName = 'Cookie';
        req.paraVal = req.msg.Cookie;
        return req.conn.sendText(response.getStr(req, 404));
      }

      userDao.getById(req.msg.UserId, func);
    }
  ], (err, res) => {
    if (!!err) {
      logger.error("getUser internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    }

    logger.info("getUser success");

    var user = {};
    user.Id = res.id;
    user.Name = res.name;
    user.Type = res.type;
    user.RealName = res.real_name;
    user.Description = res.description;
    user.CardNumber = res.card_number;

    var ret = response.getJson(req, 200);
    ret.User = user;

    return req.conn.sendText(JSON.stringify(ret));
  });
}

function editUser(req) {
  return;
}

function logIn(req) {
  return;
}

function logOut(req) {
  return;
}

function getDepartment(req) {
  return;
}

function listSchedule(req) {
  return;
}

function getGuide(req) {
  return;
}

function addRegistration(req) {
  return;
}

function removeRegistration(req) {
  return;
}

function editRegistration(req) {
  return;
}

function listRegistration(req) {
  return;
}

function listPrescription(req) {
  return;
}

function onlinePay(req) {
  return;
}