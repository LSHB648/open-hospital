var uuid = require('node-uuid');
var constx = require('./const');
var mysqlService = require('./mysqlService');

var registrationDao = module.exports;

registrationDao.add = (reg, cb) => {
  var id = uuid.v4();
  var time = Date.now();

  var sql = 'INSERT INTO oh_registration ' +
              '(id, user_id, department_id, doctor_id, status, ' +
              'create_time, update_time) ' + 
              'VALUES (?, ?, ?, ?, ?, ?, ?)';

  var args = [
    id,
    reg.userId,
    reg.departmentId,
    reg.doctorId,
    reg.status,
    time,
    time
  ];

  mysqlService.query(sql, args, cb);
};

registrationDao.getOnGoing = (reg, cb) => {
  var sql = 'SELECT * FROM oh_registration WHERE user_id = ? AND department_id = ? AND (status = ? OR status = ?)';

  var args = [reg.userId, reg.departmentId, constx.REG_STATUS.waiting, constx.REG_STATUS.working];

  mysqlService.query(sql, args, cb);
};

registrationDao.getByRegIdUid = (reg, cb) => {
  var sql = 'SELECT * FROM oh_registration WHERE user_id = ? AND id = ?';

  var args = [reg.userId, reg.id];

  mysqlService.query(sql, args, cb);
};

registrationDao.getByRegIdDid = (reg, cb) => {
  var sql = 'SELECT * FROM oh_registration WHERE doctor_id = ? AND id = ?';

  var args = [reg.doctorId, reg.id];

  mysqlService.query(sql, args, cb);
};

registrationDao.deleteById = (id, cb) => {
  var sql = 'DELETE FROM oh_registration WHERE id = ?';

  var args = [id];

  mysqlService.delete(sql, args, cb);
};

registrationDao.updateDoctor = (reg, cb) => {
  var sql = 'UPDATE oh_registration SET doctor_id = ? WHERE id = ?';

  var args = [reg.doctorId, reg.id];

  mysqlService.update(sql, args, cb);
};

registrationDao.getByUserId = (id, cb) => {
  var sql = 'SELECT * FROM oh_registration WHERE user_id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};

registrationDao.getByDoctorId = (id, cb) => {
  var sql = 'SELECT * FROM oh_registration WHERE doctor_id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};

registrationDao.updateStatus = (reg, cb) => {
  var sql = 'UPDATE oh_registration SET status = ? WHERE id = ?';

  var args = [reg.status, reg.id];

  mysqlService.update(sql, args, cb);
};