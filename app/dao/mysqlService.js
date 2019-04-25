var mysql = require('mysql');
var logger = require('../log/logger').getLogger('main');

var CONN_LIMIT = 20;
var mysqlService = module.exports;
var connPool = null;

mysqlService.init = (config) => {
  if (connPool != null) {
    return;
  }

  __init(config);
};

mysqlService.query = (sql, args, cb) => {
  connPool.getConnection((err, conn) => {
    if (!!err) {
      logger.error("getConnection err = %j", err);
      cb(err);
      return;
    }

    conn.query(sql, args, (err, res) => {
      if (!!err && err.fatal) {
        logger.error("mysql query fatal error = %j", err);
        conn.destroy();
      } else {
        conn.release();
      }

      cb(err, res);
    });
  });
};

mysqlService.delete = mysqlService.query;
mysqlService.update = mysqlService.query;

mysqlService.shutdown = () => {
  connPool.destroyAllNow();
};

function __init(config) {
  connPool = mysql.createPool({
    connectionLimit: CONN_LIMIT,
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    database: config.database
  });
}