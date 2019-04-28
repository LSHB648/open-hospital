var uuid = require('node-uuid');
var mysqlService = require('./mysqlService');

var chargeDao = module.exports;

chargeDao.add = (cha, cb) => {
  var id = uuid.v4();
  var time = Date.now();

  var sql = 'INSERT INTO oh_charge ' +
              '(id, prescription_id, examination_fee, medicine_fee, ' +
              'total_fee, status, create_time, update_time) ' + 
              'VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  var args = [
    id,
    cha.preId,
    cha.examFee,
    cha.medcFee,
    cha.totalFee,
    cha.status,
    time,
    time
  ];

  mysqlService.query(sql, args, cb);
};

chargeDao.getById = (id, cb) => {
  var sql = 'SELECT * FROM oh_charge WHERE id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};

chargeDao.getByPrescriptionId = (id, cb) => {
  var sql = 'SELECT * FROM oh_charge WHERE prescription_id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};

chargeDao.updateStatus = (cha, cb) => {
  var time = Date.now();

  var sql = 'UPDATE oh_charge SET status = ? , update_time = ? WHERE id = ?';

  var args = [cha.status, time, cha.id];

  mysqlService.update(sql, args, cb);
};