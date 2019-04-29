var async = require('async');
var constx = require('../util/constx');
var response = require('../util/response');
var redisService = require('../dao/redisService');
var cookieService = require('./cookieService');
var wsConnService = require('./wsConnService');
var patientHandler = require('./patientHandler');
var registrationDao = require('../dao/registrationDao');
var prescriptionDao = require('../dao/prescriptionDao');
var userDao = require('../dao/userDao');
var dpDocDao = require('../dao/dpDocDao');
var chargeDao = require('../dao/chargeDao');
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

      req.msg.DoctorId = ckDec.userId;
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
      reg.doctorId = req.msg.DoctorId;

      registrationDao.getByRegIdDid(reg, func);
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

      req.msg.Reg = res;

      var reg = {};
      reg.id = req.msg.RegistrationId;
      reg.status = constx.REG_STATUS.working;
      registrationDao.updateStatus(reg, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("callRegistration internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("callRegistration success");
      req.conn.sendText(response.getStr(req, 200));

      // 主动推送叫号信息给门诊用户
      req.userId = req.msg.Reg.user_id;
      var conn = wsConnService.get(req);

      // 组装挂号信息
      var reg = {};
      reg.Id = req.msg.Reg.id;
      reg.UserId = req.msg.Reg.user_id;
      reg.DepartmentId = req.msg.Reg.department_id;
      reg.DoctorId = req.msg.Reg.doctor_id;
      reg.status = constx.REG_STATUS.working;

      // 组装响应
      req.category = constx.RES_CATEGORY.push;
      var ret = response.getJson(req, 200);
      ret.Registration = reg;

      try {
        return conn.sendText(JSON.stringify(ret));

      } catch (e) {
        logger.error("req push error, error = %j", e);
      }
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

      req.msg.DoctorId = ckDec.userId;
      redisService.getKey(key, func);

    }, (cookie, func) => {
      if (cookie !== req.msg.Cookie) {
        logger.error("req para Cookie wrong or expired");
        return req.conn.sendText(response.getStr(req, 408));
      }

      dpDocDao.getByDoctorId(req.msg.DoctorId, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req doctor not found");
        return req.conn.sendText(response.getStr(req, 407));
      }

      req.msg.DepartmentId = res.department_id;

      userDao.getById(req.msg.UserId, func);
    }, (res, func) => {
      if (!res || res.type !== constx.USER_TYPE.patient) {
        logger.error("req userId not found or type error");
        req.rid = req.msg.UserId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      var pre = {};
      pre.userId = req.msg.UserId;
      pre.departmentId = req.msg.DepartmentId;
      pre.doctorId = req.msg.DoctorId;
      pre.content = req.msg.Content;

      prescriptionDao.add(pre, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("addPrescription internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("addPrescription success");;
    return req.conn.sendText(response.getStr(req, 200));
  });
}

function listPrescription(req) {
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

      prescriptionDao.getByDoctorId(req.msg.UserId, func);
    }
  ], (err, res) => {
    if (!!err) {
      logger.error("listPrescription internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("listPrescription success");

    var pres = [];

    for (var p of res) {
      var pre = {};

      pre.Id = p.id;
      pre.UserId = p.user_id;
      pre.DepartmentId = p.department_id;
      pre.DoctorId = p.doctor_id;
      pre.Content = p.content;

      pres.push(pre);
    }

    var ret = response.getJson(req, 200);
    ret.Prescriptions = pres;
    return req.conn.sendText(JSON.stringify(ret));
  });
}

function addCharge(req) {
  if (!req.msg.hasOwnProperty('PrescriptionId')) {
    logger.error("req para PrescriptionId not found");
    req.paraName = 'PrescriptionId';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!req.msg.hasOwnProperty('ExamFee')) {
    logger.error("req para ExamFee not found");
    req.paraName = 'ExamFee';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (typeof(req.msg.ExamFee) !== 'number' || req.msg.ExamFee <= 0 || req.msg.ExamFee % 1 !== 0) {
    logger.error("req paraVal ExamFee wrong");
    req.paraName = 'ExamFee';
    req.paraVal = req.msg.ExamFee;
    return req.conn.sendText(response.getStr(req, 404));
  }

  if (!req.msg.hasOwnProperty('MedcFee')) {
    logger.error("req para MedcFee not found");
    req.paraName = 'MedcFee';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (typeof(req.msg.MedcFee) !== 'number' || req.msg.MedcFee <= 0 || req.msg.MedcFee % 1 !== 0) {
    logger.error("req paraVal MedcFee wrong");
    req.paraName = 'MedcFee';
    req.paraVal = req.msg.MedcFee;
    return req.conn.sendText(response.getStr(req, 404));
  }

  if (!req.msg.hasOwnProperty('TotalFee')) {
    logger.error("req para TotalFee not found");
    req.paraName = 'TotalFee';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (typeof(req.msg.TotalFee) !== 'number' || req.msg.TotalFee <= 0 || req.msg.TotalFee % 1 !== 0) {
    logger.error("req paraVal TotalFee wrong");
    req.paraName = 'TotalFee';
    req.paraVal = req.msg.TotalFee;
    return req.conn.sendText(response.getStr(req, 404));
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

      prescriptionDao.getById(req.msg.PrescriptionId, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req PrescriptionId not found");
        req.rid = req.msg.PrescriptionId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      chargeDao.getByPrescriptionId(req.msg.PrescriptionId, func);
    }, (res, func) => {
      if (!!res) {
        logger.error("req charge duplicate");
        req.resource = req.msg.PrescriptionId;
        return req.conn.sendText(response.getStr(req, 405));
      }

      var cha = {};
      cha.preId = req.msg.PrescriptionId;
      cha.examFee = req.msg.ExamFee;
      cha.medcFee = req.msg.MedcFee;
      cha.totalFee = req.msg.TotalFee;
      cha.status = constx.CHARGE_STATUS.waiting;

      chargeDao.add(cha, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("addCharge internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("addCharge success");
      return req.conn.sendText(response.getStr(req, 200));
    }
  });
}