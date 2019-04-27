var async = require('async');
var constx = require('../util/constx');
var stringx = require('../util/stringx');
var response = require('../util/response');
var redisService = require('../dao/redisService');
var cookieService = require('./cookieService');
var userDao = require('../dao/userDao');
var logger = require('../log/logger').getLogger('main');

var adminHandler = module.exports;
var handler = {};

adminHandler.getHandler = () => {
  handler[constx.ACTION.registerUser] = registerUser;
  handler[constx.ACTION.deRegisterUser] = deRegisterUser;
  handler[constx.ACTION.listUser] = listUser;
  handler[constx.ACTION.logIn] = logIn;
  handler[constx.ACTION.logOut] = logOut;
  handler[constx.ACTION.registerDepartment] = registerDepartment;
  handler[constx.ACTION.deRegisterDepartment] = deRegisterDepartment;
  handler[constx.ACTION.getDepartment] = getDepartment;
  handler[constx.ACTION.editDepartment] = editDepartment;
  handler[constx.ACTION.listDepartment] = listDepartment;
  handler[constx.ACTION.addDoctor] = addDoctor;
  handler[constx.ACTION.removeDoctor] = removeDoctor;
  handler[constx.ACTION.addSchedule] = addSchedule;
  handler[constx.ACTION.removeSchedule] = removeSchedule;
  handler[constx.ACTION.listSchedule] = listSchedule;
  handler[constx.ACTION.editGuide] = editGuide;
  handler[constx.ACTION.getGuide] = getGuide;

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

  if (!req.msg.hasOwnProperty('Type')) {
    logger.error("req para Type not found");
    req.paraName = 'Type';
    return req.conn.sendText(response.getStr(req, 403));
  }

  // 系统管理员只能注册医生用户或者挂号员用户
  if ((req.msg.Type !== constx.USER_TYPE.doctor) &&
    (req.msg.Type !== constx.USER_TYPE.registrar)) {
      logger.error("req paraVal Type error");
      req.paraName = 'Type';
      req.paraVal = req.msg.Type;
      return req.conn.sendText(response.getStr(req, 404));
  }

  if (!req.msg.hasOwnProperty('RealName')) {
    logger.error("req para RealName not found");
    req.paraName = 'RealName';
    return req.conn.sendText(response.getStr(req, 403));
  }

  async.waterfall([
    (func) => {
      var ckDec = cookieService.decode(req.msg.Cookie);
      var key = constx.PREFIX.cookieCache + ckDec.userId;
      redisService.getKey(key, func);

    }, (cookie, func) => {
      if (cookie !== req.msg.Cookie) {
        logger.error("req para Cookie wrong or expired");
        req.paraName = 'Cookie';
        req.paraVal = req.msg.Cookie;
        return req.conn.sendText(response.getStr(req, 404));
      }

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

function deRegisterUser(req) {
  if (!req.msg.hasOwnProperty('UserId')) {
    logger.error("req para UserId not found");
    req.paraName = 'UserId';
    return req.conn.sendText(response.getStr(req, 403));
  }

  async.waterfall([
    (func) => {
      var ckDec = cookieService.decode(req.msg.Cookie);
      var key = constx.PREFIX.cookieCache + ckDec.userId;
      redisService.getKey(key, func);

    }, (cookie, func) => {
      if (cookie !== req.msg.Cookie) {
        logger.error("req para Cookie wrong or expired");
        return req.conn.sendText(response.getStr(req, 408));
      }

      userDao.getById(req.msg.UserId, func);

    }, (res, func) => {
      if (!res) {
        logger.error("req UserId not exists");
        req.rid = req.msg.UserId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      var key = constx.PREFIX.cookieCache + req.msg.UserId;
      redisService.delKey(key, func);

    }, (func) => {
      userDao.deleteById(req.msg.UserId, func);

    }
  ], (err) => {
    if (!!err) {
      logger.error("deRegisterUser internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("deRegisterUser success");
      return req.conn.sendText(response.getStr(req, 200));
    }
  });
}

function listUser(req) {
  async.waterfall([
    (func) => {
      var ckDec = cookieService.decode(req.msg.Cookie);
      var key = constx.PREFIX.cookieCache + ckDec.userId;
      redisService.getKey(key, func);

    }, (cookie, func) => {
      if (cookie !== req.msg.Cookie) {
        logger.error("req para Cookie wrong or expired");
        req.paraName = 'Cookie';
        req.paraVal = req.msg.Cookie;
        return req.conn.sendText(response.getStr(req, 404));
      }

      userDao.getAll(func);
    }
  ], (err, res) => {
    if (!!err) {
      logger.error("listUser internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("listUser success");

    var users = [];

    for (var u of res) {
      var user = {};

      user.Id = u.id;
      user.Name = u.name;
      user.Type = u.type;
      user.RealName = u.real_name;
      user.Description = u.description;
      user.CardNumber = u.card_number;

      users.push(user);
    }

    var ret = response.getJson(req, 200);
    ret.Users = users;
    return req.conn.sendText(JSON.stringify(ret));
  });
}

function logIn(req) {
  return;
}

function logOut(req) {
  return;
}

function registerDepartment(req) {
  return;
}

function deRegisterDepartment(req) {
  return;
}

function getDepartment(req) {
  return;
}

function editDepartment(req) {
  return;
}

function listDepartment(req) {
  return;
}

function addDoctor(req) {
  return;
}

function removeDoctor(req) {
  return;
}

function addSchedule(req) {
  return;
}

function removeSchedule(req) {
  return;
}

function listSchedule(req) {
  return;
}

function editGuide(req) {
  return;
}

function getGuide(req) {
  return;
}