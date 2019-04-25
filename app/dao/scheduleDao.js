var mysqlService = require('./mysqlService');

var scheduleDao = module.exports;

scheduleDao.add = (sch, cb) => {
  var time = Date.now();

  var sql = 'INSERT INTO oh_schedule ' +
              '(department_id, doctor_id, create_time, update_time) ' + 
              'VALUES (?, ?, ?, ?)';

  var args = [
    sch.departmentId,
    sch.doctorId,
    time,
    time
  ];

  mysqlService.query(sql, args, cb);
};

scheduleDao.getByDDId = (departmentId, doctorId, cb) => {
  var sql = 'SELECT * FROM oh_schedule WHERE department_id = ? AND doctor_id = ?';

  var args = [departmentId, doctorId];

  mysqlService.query(sql, args, cb);
};

scheduleDao.deleteByDoctorId = (id, cb) => {
  var sql = 'DELETE FROM oh_schedule WHERE doctor_id = ?';

  var args = [id];

  mysqlService.delete(sql, args, cb);
};

scheduleDao.getByDepartmentId = (id, cb) => {
  var sql = 'SELECT * FROM oh_schedule WHERE department_id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};