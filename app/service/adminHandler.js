var async = require('async');
var constx = require('../util/constx');
var stringx = require('../util/stringx');
var response = require('../util/response');
var redisService = require('../dao/redisService');
var cookieService = require('./cookieService');
var userDao = require('../dao/userDao');
var departmentDao = require('../dao/departmentDao');
var dpDocDao = require('../dao/dpDocDao');
var logger = require('../log/logger').getLogger('main');

var adminHandler = module.exports;
var handler = {};

adminHandler.getHandler = () => {
  handler[constx.ACTION.registerUser] = registerUser;
  handler[constx.ACTION.deRegisterUser] = deRegisterUser;
  handler[constx.ACTION.listUser] = listUser;
  handler[constx.ACTION.logIn] = adminHandler.logIn;
  handler[constx.ACTION.logOut] = adminHandler.logOut;
  handler[constx.ACTION.registerDepartment] = registerDepartment;
  handler[constx.ACTION.deRegisterDepartment] = deRegisterDepartment;
  handler[constx.ACTION.getDepartment] = adminHandler.getDepartment;
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

adminHandler.logIn = (req) => {
  if (!req.msg.hasOwnProperty('Name')) {
    logger.error("req para Name not found");
    req.paraName = 'Name';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!req.msg.hasOwnProperty('PassWord')) {
    logger.error("req para PassWord not found");
    req.paraName = 'PassWord';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!req.msg.hasOwnProperty('Type')) {
    logger.error("req para Type not found");
    req.paraName = 'Type';
    return req.conn.sendText(response.getStr(req, 403));
  }

  async.waterfall([
    (func) => {
      var user = {};
      user.name = req.msg.Name;
      user.password = req.msg.PassWord;
      user.type = req.msg.Type;

      userDao.getLogIn(req.msg.Name, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req logIn not found");
        return req.conn.sendText(response.getStr(req, 409));
      }

      var key = constx.PREFIX.cookieCache + res.id;
      var cookie = cookieService.create(req.msg.Type, res.id, func);
      req.msg.Cookie = cookie;
      redisService.setKeyExpire(key, cookie, constx.TIMEOUT.cookie, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("logIn internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("logIn success");

    var ret = response.getJson(req, 200);
    ret.Cookie = req.msg.Cookie;
    return req.conn.sendText(JSON.stringify(ret));
  });
}

adminHandler.logOut = (req) => {
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

      var key = constx.PREFIX.cookieCache + req.msg.UserId;
      redisService.delKey(key, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("logOut internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("logOut success");
      return req.conn.sendText(response.getStr(req, 200));
    }
  });
}

function registerDepartment(req) {
  if (!req.msg.hasOwnProperty('Name')) {
    logger.error("req para Name not found");
    req.paraName = 'Name';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (req.msg.Name.length < 1 || req.msg.Name.length > 63) {
    logger.error("req paraVal Name error");
    req.paraName = 'Name';
    req.paraVal = req.msg.Name;
    return req.conn.sendText(response.getStr(req, 404));
  }

  if (!req.msg.hasOwnProperty('Description')) {
    logger.error("req para Description not found");
    req.paraName = 'Description';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (req.msg.Description.length < 1 || req.msg.Description.length > 254) {
    logger.error("req paraVal Description error");
    req.paraName = 'Description';
    req.paraVal = req.msg.Description;
    return req.conn.sendText(response.getStr(req, 404));
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

      departmentDao.getByName(req.msg.Name, func);
    }, (res, func) => {
      if (!!res) {
        logger.error("req para Name already exists");
        req.resource = req.msg.Name;
        return req.conn.sendText(response.getStr(req, 405));
      }

      var dp = {};
      dp.name = req.msg.Name;
      dp.description = req.msg.Description;

      departmentDao.add(dp, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("registerDepartment internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("registerDepartment success");
      return req.conn.sendText(response.getStr(req, 200));
    }
  });
}

function deRegisterDepartment(req) {
  if (!req.msg.hasOwnProperty('DepartmentId')) {
    logger.error("req para DepartmentId not found");
    req.paraName = 'DepartmentId';
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

      departmentDao.getById(req.msg.DepartmentId, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req resource DepartmentId not found");
        req.rid = req.msg.DepartmentId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      departmentDao.deleteById(req.msg.DepartmentId, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("deRegisterDepartment internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));

    } else {
      logger.info("deRegisterDepartment success");
      return req.conn.sendText(response.getStr(req, 200));
    }
  });
}

adminHandler.getDepartment = (req) => {
  if (!req.msg.hasOwnProperty('DepartmentId')) {
    logger.error("req para DepartmentId not found");
    req.paraName = 'DepartmentId';
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

      departmentDao.getById(req.msg.DepartmentId, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req resource DepartmentId not found");
        req.rid = req.msg.DepartmentId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      _getDepartmentDetail(req.msg.DepartmentId, func);
    }
  ], (err, res) => {
    if (!!err) {
      logger.error("getDepartment internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("getDepartment success");

    var ret = response.getJson(req, 200);
    ret.Department = res;
    return req.conn.sendText(JSON.stringify(ret));
  });
}

function editDepartment(req) {
  if (!req.msg.hasOwnProperty('DepartmentId')) {
    logger.error("req para DepartmentId not found");
    req.paraName = 'DepartmentId';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!req.msg.hasOwnProperty('Name')) {
    logger.error("req para Name not found");
    req.paraName = 'Name';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (req.msg.Name.length < 1 || req.msg.Name.length > 63) {
    logger.error("req paraVal Name error");
    req.paraName = 'Name';
    req.paraVal = req.msg.Name;
    return req.conn.sendText(response.getStr(req, 404));
  }

  if (!req.msg.hasOwnProperty('Description')) {
    logger.error("req para Description not found");
    req.paraName = 'Description';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (req.msg.Description.length < 1 || req.msg.Description.length > 254) {
    logger.error("req paraVal Description error");
    req.paraName = 'Description';
    req.paraVal = req.msg.Description;
    return req.conn.sendText(response.getStr(req, 404));
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

      departmentDao.getById(req.msg.DepartmentId, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req resource DepartmentId not found");
        req.rid = req.msg.DepartmentId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      var dp = {};
      dp.id = req.msg.DepartmentId;
      dp.name = req.msg.Name;
      dp.description = req.msg.Description;

      departmentDao.updateInfo(dp, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("editDepartment internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("editDepartment success");
    return req.conn.sendText(response.getStr(req, 200));
  });
}

adminHandler.listDepartment = (req) => {
  var dps = [];

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

      departmentDao.getAll(func);
    }, (res, func) => {
      async.each(res, (dp, next) => {
        _getDepartmentDetail(dp.id, (err, detail) => {
          if (!!err) {
            logger.error("_getDepartmentDetail error = %j", err);
            return next(err);
          }

          dps.push(detail);
          return next(null);
        });
      }, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("listDepartment internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("listDepartment success");

    var ret = response.getJson(req, 200);
    ret.Departments = dps;
    return req.conn.sendText(JSON.stringify(ret));
  });
}

function addDoctor(req) {
  if (!req.msg.hasOwnProperty('UserId')) {
    logger.error("req para UserId not found");
    req.paraName = 'UserId';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!req.msg.hasOwnProperty('DepartmentId')) {
    logger.error("req para DepartmentId not found");
    req.paraName = 'DepartmentId';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (!req.msg.hasOwnProperty('Description')) {
    logger.error("req para Description not found");
    req.paraName = 'Description';
    return req.conn.sendText(response.getStr(req, 403));
  }

  if (req.msg.Description.length < 1 || req.msg.Description.length > 254) {
    logger.error("req paraVal Description error");
    req.paraName = 'Description';
    req.paraVal = req.msg.Description;
    return req.conn.sendText(response.getStr(req, 404));
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
        logger.error("req resource UserId not found");
        req.rid = req.msg.UserId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      if (res.type !== constx.USER_TYPE.patient) {
        logger.error("req user type not patient");
        return req.conn.sendText(response.getStr(req, 408));
      }

      departmentDao.getById(req.msg.DepartmentId, func);
    }, (res, func) => {
      if (!res) {
        logger.error("req resource DepartmentId not found");
        req.rid = req.msg.DepartmentId;
        return req.conn.sendText(response.getStr(req, 406));
      }

      dpDocDao.getByDoctorId(req.msg.UserId, func);
    }, (res, func) => {
      if (!!res) {
        logger.error("req resource duplicate");
        return req.conn.sendText(response.getStr(req, 410));
      }

      var dd = {};
      dd.departmentId = req.msg.DepartmentId;
      dd.doctorId = req.msg.UserId;

      dpDocDao.add(dd, func);
    }, (res, func) => {
      var user = {};
      user.id = req.msg.UserId;
      user.description = req.msg.Description;

      userDao.updateDescription(user, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("addDoctor internal error = %s", err);
      return req.conn.sendText(response.getStr(req, 407));
    }

    logger.info("addDoctor success");
    return req.conn.sendText(response.getStr(req, 200));
  });
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

function _getDepartmentDetail(id, cb) {
  var dp = {};

  async.waterfall([
    (func) => {
      departmentDao.getById(id, func);

    }, (res, func) => {
      dp.Id = res.id;
      dp.Name = res.name;
      dp.Description = res.description;
      dp.Doctors = [];

      dpDocDao.getByDepartmentId(id, func);

    }, (res, func) => {
      async.each(res, (dd, next) => {
        userDao.getById(dd.doctor_id, (err, user) => {
          if (!!err) {
            logger.error("userDao.getById error = %j", err);
            return next(err);
          }

          if (!user) {
            logger.error("userDao.getById not found");
            return next("doctor_id not found");
          }

          var elem = {};
          elem.Id = user.id;
          elem.Name = user.name;
          elem.Type = user.type;
          elem.RealName = user.real_name;
          elem.Description = user.description;
          elem.CardNumber = user.card_number;

          dp.Doctors.push(elem);
          return next(null);
        });
      }, func);
    }
  ], (err) => {
    if (!!err) {
      logger.error("_getDepartmentDetail internal error = %s", err);
      return cb(err, null);
    }

    logger.info("_getDepartmentDetail success");
    return cb(err, dp);
  });
}