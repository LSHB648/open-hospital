var async = require('async');
var constx = require('../util/constx');
var response = require('../util/response');
var redisService = require('../dao/redisService');
var cookieService = require('./cookieService');
var patientHandler = require('./patientHandler');
var userDao = require('../dao/userDao');
var registrationDao = require('../dao/registrationDao');
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
  return;
}

function addPrescription(req) {
  return;
}

function listPrescription(req) {
  return;
}

function addCharge(req) {
  return;
}