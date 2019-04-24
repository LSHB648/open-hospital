var mysql = require('mysql');
var logger = require('../log/logger').getLogger('main');

var sqlClient = module.exports;

var __pool = null;

sqlClient.init = (config) => {
    if (__pool != null) {
        return sqlClient;
    }

    __init(config);
};

sqlClient.query = (sql, args, cb) => {
    __pool.getConnection( (err, conn) => {
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
    __pool.destroyAllNow();
};

function __init(config) {
    __pool = mysql.createPool({
        connectionLimit: 20,
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port,
        database: config.database
      });
}