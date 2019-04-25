var mysqlService = require('./mysqlService');

var guideDao = module.exports;

guideDao.add = (gd, cb) => {
  var time = Date.now();

  var sql = 'INSERT INTO oh_guide ' +
              '(key, value, create_time, update_time) ' + 
              'VALUES (?, ?, ?, ?)';

  var args = [
    gd.key,
    gd.value,
    time,
    time
  ];

  mysqlService.query(sql, args, cb);
};

guideDao.getByKey = (key, cb) => {
  var sql = 'SELECT * FROM oh_guide WHERE key = ?';

  var args = [key];

  mysqlService.query(sql, args, cb);
};

guideDao.getByKey = (key, cb) => {
  var sql = 'SELECT * FROM oh_guide WHERE key = ?';

  var args = [key];

  mysqlService.query(sql, args, cb);
};

guideDao.updateValue = (gd, cb) => {
  var sql = 'UPDATE oh_guide SET value = ? WHERE key = ?';

  var args = [gd.value, gd.key];

  mysqlService.update(sql, args, cb);
};