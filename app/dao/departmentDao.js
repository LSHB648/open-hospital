var uuid = require('node-uuid');
var mysqlService = require('./mysqlService');

var departmentDao = module.exports;

departmentDao.add = (dp, cb) => {
  var id = uuid.v4();
  var time = Date.now();

  var sql = 'INSERT INTO oh_department ' +
              '(id, name, description, create_time, update_time) ' + 
              'VALUES (?, ?, ?, ?, ?)';

  var args = [
    id,
    dp.name,
    dp.description,
    time,
    time
  ];

  mysqlService.query(sql, args, cb);
};

departmentDao.getById = (id, cb) => {
  var sql = 'SELECT * FROM oh_department WHERE id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};

departmentDao.deleteById = (id, cb) => {
  var sql = 'DELETE FROM oh_department WHERE id = ?';

  var args = [id];

  mysqlService.delete(sql, args, cb);
};

departmentDao.updateInfo = (dp, cb) => {
  var sql = 'UPDATE oh_department SET name = ? , description = ? WHERE id = ?';

  var args = [dp.name, dp.description, dp.id];

  mysqlService.update(sql, args, cb);
};

departmentDao.getAll = (cb) => {
  var sql = 'SELECT * FROM oh_department';

  var args = [];

  mysqlService.query(sql, args, cb);
};