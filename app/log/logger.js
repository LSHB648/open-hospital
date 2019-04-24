var log4js = require("log4js");
var logConf = require("../../config/log4js.json");

log4js.configure(logConf);

var logger = module.exports;

logger.getLogger = (cat) => {
    return log4js.getLogger(cat);
};

logger.shutdown = (cb) => {
    log4js.shutdown(cb);
};