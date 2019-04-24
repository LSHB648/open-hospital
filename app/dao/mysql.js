var mysql = require('mysql');
var logger = require('../log/logger').getLogger('main');

var sqlClient = module.exports;

var connPool = null;

sqlClient.init = (config) => {
  if (connPool != null) {
    return;
  }

  __init(config);
};

sqlClient.query = (sql, args, cb) => {
  connPool.getConnection( (err, conn) => {
    if (!!err) {
      logger.error("getConnection failed");
      cb(err);
      return;
    }

    conn.query(sql, args, (err, res) => {
      if (!!err && err.fatal) {
        logger.error("mysql query fatal error");
        conn.destroy();
      } else {
        logger.error("mysql query failed");
        conn.release();
      }

      cb(err, res);
    });
  });
};

sqlClient.delete = sqlClient.query;
sqlClient.update = sqlClient.query;

sqlClient.shutdown = () => {
  connPool.destroyAllNow();
};

function __init(config) {
  connPool = mysql.createPool({
    connectionLimit: 20,
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    database: config.database
  });
}