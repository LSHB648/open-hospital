var async = require('async');
var constx = require('../util/constx');
var response = require('../util/response');
var redisService = require('../dao/redisService');
var cookieService = require('./cookieService');
var wsConnService = require('./wsConnService');
var patientHandler = require('./patientHandler');
var registrationDao = require('../dao/registrationDao');
var prescriptionDao = require('../dao/prescriptionDao');
var dpDocDao = require('../dao/dpDocDao');
var adminHandler = require('./adminHandler');
var logger = require('../log/logger').getLogger('main');

var doctorHandler = module.exports;
var handler = {};

doctorHandler.getHandler = () => {
  handler[constx.ACTION.getUser] = patientHandler.getUser;
  handler[constx.ACTION.logIn] = adminHandler.logIn;
  handler[constx.ACTION.logOut] = adminHandler.logOut;
  handler[constx.ACTION.getDepartment] = adminHandler.getDepartment;
  handler[constx.ACTION.listDepartment] = adminHandler.listDepartment;
  handler[constx.ACTION.listSchedule] = adminHandler.listSchedule;
  handler[constx.ACTION.getGuide] = adminHandler.getGuide;
  handler[constx.ACTION.listRegistration] = listRegistration;
  handler[constx.ACTION.callRegistration] = callRegistration;
  handler[constx.ACTION.addPrescription] = addPrescription;
  handler[constx.ACTION.listPrescription] = listPrescription;
  handler[constx.ACTION.addCharge] = addCharge;

  return handler;
};

function listRegistration(req) {
  async.waterfall([
    (func) => {
      var ckDec = cookieService.decode(req.msg.Cookie);
      var key = constx.PREFIX.cookieCache + ckDec.userId;

      req.msg.UserId = ckDec.userId;
      redisService.getKey(key, func);

    }, (cookie, func) => {
      if (cookie !== req.msg.Cookie) {
        logger.error("req para Cookie wrong or expired");
        req.paraName = 'Cookie';
        req.paraVal = req.msg.Cookie;
        return req.conn.sendText(response.getStr(req, 404));
      }

      registrationDao.getByDoctorId(req.msg.UserId, func);
    }
  ], (err, res) => {
    if (!!err) {
      logger.error("listRegistration internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("listRegistration success");

    var regs = [];

    for (var r of res) {
      var reg = {};

      reg.Id = r.id;
      reg.UserId = r.user_id;
      reg.DepartmentId = r.department_id;
      reg.DoctorId = r.doctor_id;
      reg.Status = r.status;

      regs.push(reg);
    }

    var ret = response.getJson(req, 200);
    ret.Registrations = regs;
    return req.conn.sendText(JSON.stringify(ret));
  });
}

function callRegistration(req) {
  if (!req.msg.hasOwnProperty('RegistrationId')) {
    logger.error("req para RegistrationId not found");
    req.paraName = 'RegistrationId';
    return req.conn.sendText(response.getStr(req, 403));
  }

  async.waterfall([
    (func) => {
      var ckDec = cookieService.decode(req.msg.Cookie);
      var key = constx.PREFIX.cookieCache + ckDec.userId;

      req.msg.UserId = ckDec.userId;
      redisService.getKey(key, func);

    }, (cookie, func) => {
      if (cookie !== req.msg.Cookie) {
        logger.error("req para Cookie wrong or expired");
        req.paraName = 'Cookie';
        req.paraVal = req.msg.Cookie;
        return req.conn.sendText(response.getStr(req, 404));
      }

      var reg = {};
      reg.id = req.msg.RegistrationId;
      reg.userId = req.msg.UserId;

      registrationDao.getByRegIdUid(reg, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req registration not exists");
        req.rid = req.msg.RegistrationId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      if (res.status !== constx.REG_STATUS.waiting) {
        logger.error("req registration status not allowed to call");
        return req.conn.sendText(response.getStr(req, 408));
      }

      func(null, res);
    }
  ], (err, res) => {
    if (!!err) {
      logger.error("callRegistration internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("callRegistration success");
      req.conn.sendText(response.getStr(req, 200));

      // 主动推送叫号信息给门诊用户
      req.userId = res.user_id;
      var conn = wsConnService.get(req);

      // 组装挂号信息
      var reg = {};
      reg.Id = res.id;
      reg.UserId = res.user_id;
      reg.DepartmentId = res.department_id;
      reg.DoctorId = res.doctor_id;
      reg.status = res.status;

      // 组装响应
      req.category = constx.RES_CATEGORY.push;
      var ret = response.getJson(req, 200);
      ret.Registration = reg;

      return conn.sendText(JSON.stringify(ret));
    }
  });
}

function addPrescription(req) {
  if (!req.msg.hasOwnProperty('UserId')) {
    logger.error("req para UserId not found");
    req.paraName = 'UserId';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!req.msg.hasOwnProperty('Content')) {
    logger.error("req para Content not found");
    req.paraName = 'Content';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (req.msg.Content.length < 1 || req.msg.Content.length > 254) {
    logger.error("req paraVal Content error");
    req.paraName = 'Content';
    req.paraVal = req.msg.Content;
    return req.conn.sendText(response.getStr(req, 404));
  }

  async.waterfall([
    (func) => {
      var ckDec = cookieService.decode(req.msg.Cookie);
      var key = constx.PREFIX.cookieCache + ckDec.userId;

      req.msg.doctorId = ckDec.userId;
      redisService.getKey(key, func);

    }, (cookie, func) => {
      if (cookie !== req.msg.Cookie) {
        logger.error("req para Cookie wrong or expired");
        return req.conn.sendText(response.getStr(req, 408));
      }

      dpDocDao.getByDoctorId(req.msg.doctorId, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req doctor not found");
        return req.conn.sendText(response.getStr(req, 407));
      }

      var pre = {};
      pre.userId = req.msg.UserId;
      pre.departmentId = res.department_id;
      pre.doctorId = req.msg.doctorId;
      pre.content = req.msg.Content;

      prescriptionDao.add(req.msg.UserId, func);
    }
  ], (err, res) => {
    if (!!err) {
      logger.error("addPrescription internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("addPrescription success");;
    return req.conn.sendText(response.getStr(req, 200));
  });
}

function listPrescription(req) {
  return;
}

function addCharge(req) {
  return;
}