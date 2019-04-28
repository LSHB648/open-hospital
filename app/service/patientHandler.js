var async = require('async');
var constx = require('../util/constx');
var stringx = require('../util/stringx');
var response = require('../util/response');
var redisService = require('../dao/redisService');
var cookieService = require('./cookieService');
var userDao = require('../dao/userDao');
var scheduleDao = require('../dao/scheduleDao');
var registrationDao = require('../dao/registrationDao');
var prescriptionDao = require('../dao/prescriptionDao');
var chargeDao = require('../dao/chargeDao');
var adminHandler = require('./adminHandler');
var logger = require('../log/logger').getLogger('main');

var patientHandler = module.exports;
var handler = {};

patientHandler.getHandler = () => {
  handler[constx.ACTION.registerUser] = registerUser;
  handler[constx.ACTION.getUser] = patientHandler.getUser;
  handler[constx.ACTION.editUser] = editUser;
  handler[constx.ACTION.logIn] = adminHandler.logIn;
  handler[constx.ACTION.logOut] = adminHandler.logOut;
  handler[constx.ACTION.getDepartment] = adminHandler.getDepartment;
  handler[constx.ACTION.listDepartment] = adminHandler.listDepartment;
  handler[constx.ACTION.listSchedule] = adminHandler.listSchedule;
  handler[constx.ACTION.getGuide] = adminHandler.getGuide;
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
};

function editUser(req) {
  if (!req.msg.hasOwnProperty('CardNumber')) {
    logger.error("req para CardNumber not found");
    req.paraName = 'CardNumber';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!stringx.validateN(req.msg.CardNumber, 11)) {
    logger.error("req paraVal CardNumber error");
    req.paraName = 'CardNumber';
    req.paraVal = req.msg.CardNumber;
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

      var user = {};
      user.id = req.msg.UserId;
      user.cardNumber = req.msg.CardNumber;

      userDao.updateCardNumber(user, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("editUser internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("editUser success");
      return req.conn.sendText(response.getStr(req, 200));
    }
  });
}

function addRegistration(req) {
  if (!req.msg.hasOwnProperty('DepartmentId')) {
    logger.error("req para DepartmentId not found");
    req.paraName = 'DepartmentId';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!req.msg.hasOwnProperty('DoctorId')) {
    logger.error("req para DoctorId not found");
    req.paraName = 'DoctorId';
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

      scheduleDao.getByDDId(req.msg.DepartmentId, req.msg.DoctorId, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req doctor not on schedule");
        return req.conn.sendText(response.getStr(req, 408));
      }

      var reg = {};
      reg.userId = req.msg.UserId;
      reg.departmentId = req.msg.DepartmentId;

      registrationDao.getOnGoing(reg, func);
    }, (res, func) => {
      if (!!res) {
        logger.error("req already have registration");
        return req.conn.sendText(response.getStr(req, 408));
      }

      var reg = {};
      reg.userId = req.msg.UserId;
      reg.departmentId = req.msg.DepartmentId;
      reg.doctorId = req.msg.DoctorId;
      reg.status = constx.REG_STATUS.waiting;

      registrationDao.add(reg, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("addRegistration internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("addRegistration success");
      return req.conn.sendText(response.getStr(req, 200));
    }
  });
}

function removeRegistration(req) {
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

      registrationDao.deleteById(req.msg.RegistrationId, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("removeRegistration internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("removeRegistration success");
      return req.conn.sendText(response.getStr(req, 200));
    }
  });
}

function editRegistration(req) {
  if (!req.msg.hasOwnProperty('RegistrationId')) {
    logger.error("req para RegistrationId not found");
    req.paraName = 'RegistrationId';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!req.msg.hasOwnProperty('DoctorId')) {
    logger.error("req para DoctorId not found");
    req.paraName = 'DoctorId';
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
        logger.error("req registration status not allowed to edit");
        return req.conn.sendText(response.getStr(req, 408));
      }

      req.msg.DepartmentId = res.department_id;
      scheduleDao.getByDDId(res.department_id, req.msg.DoctorId, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req doctor not on schedule");
        req.rid = req.msg.DoctorId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      var reg = {};
      reg.id = req.msg.RegistrationId;
      reg.doctorId = req.msg.DoctorId;

      registrationDao.updateDoctor(reg, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("editRegistration internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("editRegistration success");
      return req.conn.sendText(response.getStr(req, 200));
    }
  });
}

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

      registrationDao.getByUserId(req.msg.UserId, func);
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

      prescriptionDao.getByUserId(req.msg.UserId, func);
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

function onlinePay(req) {
  if (!req.msg.hasOwnProperty('ChargeId')) {
    logger.error("req para ChargeId not found");
    req.paraName = 'ChargeId';
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
        return req.conn.sendText(response.getStr(req, 408));
      }

      chargeDao.getById(req.msg.ChargeId, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req ChargeId not found");
        req.rid = req.msg.ChargeId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      if (res.status !== constx.CHARGE_STATUS.waiting) {
        logger.error("req charge status is paid");
        return req.conn.sendText(response.getStr(req, 408));
      }

      prescriptionDao.getById(res.prescription_id, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req prescription_id not found");
        return req.conn.sendText(response.getStr(req, 407));
      }

      if (req.msg.UserId !== res.user_id) {
        logger.error("req prescription not belong to this user");
        return req.conn.sendText(response.getStr(req, 408));
      }

      // 模拟的支付操作，提取医疗卡号，扣钱

      var cha = {};
      cha.id = req.msg.ChargeId;
      cha.status = constx.CHARGE_STATUS.paid;

      chargeDao.updateStatus(cha, func);
    }
  ], (err, res) => {
    if (!!err) {
      logger.error("onlinePay internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("onlinePay success");;
    return req.conn.sendText(response.getStr(req, 200));
  });
}