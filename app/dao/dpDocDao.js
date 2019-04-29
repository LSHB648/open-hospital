var mysqlService = require('./mysqlService');

var dpDocDao = module.exports;

dpDocDao.add = (dd, cb) => {
  var time = Date.now();

  var sql = 'INSERT INTO oh_department_doctor ' +
              '(department_id, doctor_id, create_time, update_time) ' + 
              'VALUES (?, ?, ?, ?)';

  var args = [
    dd.departmentId,
    dd.doctorId,
    time,
    time
  ];

  mysqlService.query(sql, args, cb);
};

dpDocDao.getByDoctorId = (id, cb) => {
  var sql = 'SELECT * FROM oh_department_doctor WHERE doctor_id = ?';

  var args = [id];

  mysqlService.query(sql, args, (err, res) => {
    if (!!err) {
      return cb(err, null);
    }

    return cb(err, res[0]);
  });
};

dpDocDao.getByDDId = (departmentId, doctorId, cb) => {
  var sql = 'SELECT * FROM oh_department_doctor WHERE department_id = ? AND doctor_id = ?';

  var args = [departmentId, doctorId];

  mysqlService.query(sql, args, (err, res) => {
    if (!!err) {
      return cb(err, null);
    }

    return cb(err, res[0]);
  });
};

dpDocDao.deleteByDoctorId = (id, cb) => {
  var sql = 'DELETE FROM oh_department_doctor WHERE doctor_id = ?';

  var args = [id];

  mysqlService.delete(sql, args, cb);
};

dpDocDao.getByDepartmentId = (id, cb) => {
  var sql = 'SELECT * FROM oh_department_doctor WHERE department_id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};