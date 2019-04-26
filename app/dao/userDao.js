var uuid = require('node-uuid');
var mysqlService = require('./mysqlService');

var userDao = module.exports;

userDao.add = (user, cb) => {
  var id = uuid.v4();
  var time = Date.now();

  var sql = 'INSERT INTO oh_user ' +
              '(id, name, password, type, real_name, ' +
              'description, card_number, create_time, update_time) ' + 
              'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  var args = [
    id,
    user.name,
    user.password,
    user.type,
    user.realName,
    user.description,
    user.cardNumber,
    time,
    time
  ];

  mysqlService.query(sql, args, cb);
};

userDao.getByName = (name, cb) => {
  var sql = 'SELECT * FROM oh_user WHERE name = ?';

  var args = [name];

  mysqlService.query(sql, args, cb);
};

userDao.getById = (id, cb) => {
  var sql = 'SELECT * FROM oh_user WHERE id = ?';

  var args = [id];

  mysqlService.query(sql, args, cb);
};

userDao.deleteById = (id, cb) => {
  var sql = 'DELETE FROM oh_user WHERE id = ?';

  var args = [id];

  mysqlService.delete(sql, args, cb);
};

userDao.updateCardNumber = (user, cb) => {
  var time = Date.now();

  var sql = 'UPDATE oh_user SET card_number = ? , update_time = ? WHERE id = ?';

  var args = [user.id, time, user.cardNumber];

  mysqlService.update(sql, args, cb);
};

userDao.getAll = (cb) => {
  var sql = 'SELECT * FROM oh_user';

  var args = [];

  mysqlService.query(sql, args, cb);
};

userDao.getLogIn = (user, cb) => {
  var sql = 'SELECT * FROM oh_user WHERE name = ? AND password = ? AND type = ?';

  var args = [user.name, user.password, user.type];

  mysqlService.query(sql, args, cb);
};