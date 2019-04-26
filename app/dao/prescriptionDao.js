var uuid = require('node-uuid');
var mysqlService = require('./mysqlService');

var prescriptionDao = module.exports;

prescriptionDao.add = (pre, cb) => {
  var id = uuid.v4();
  var time = Date.now();

  var sql = 'INSERT INTO oh_prescription ' +
              '(id, user_id, department_id, doctor_id, content, ' +
              'create_time, update_time) ' + 
              'VALUES (?, ?, ?, ?, ?, ?, ?)';

  var args = [
    id,
    pre.userId,
    pre.departmentId,
    pre.doctorId,
    pre.content,
    time,
    time
  ];

  mysqlService.query(sql, args, cb);
};

prescriptionDao.getById = (id, cb) => {
  var sql = 'SELECT * FROM oh_prescription WHERE id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};

prescriptionDao.getByUserId = (id, cb) => {
  var sql = 'SELECT * FROM oh_prescription WHERE user_id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};

prescriptionDao.getByDoctorId = (id, cb) => {
  var sql = 'SELECT * FROM oh_prescription WHERE doctor_id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};