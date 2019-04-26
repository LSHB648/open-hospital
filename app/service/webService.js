var app = require('../application');
var constx = require('../util/constx');
var adminHandler = require('./adminHandler');
var patientHandler = require('./patientHandler');
var doctorHandler = require('./doctorHandler');
var logger = require('../log/logger').getLogger('main');

var webService = module.exports;
var handler = {};

webService.init = () => {
  if (app['enable'].indexOf(constx.MODULE_TYPE.admin) !== -1) {
    logger.info("webService enable admin module now");
    handler[constx.MODULE_TYPE.admin] = adminHandler.getHandler();
  }

  if (app['enable'].indexOf(constx.MODULE_TYPE.patient) !== -1) {
    logger.info("webService enable patient module now");
    handler[constx.MODULE_TYPE.patient] = patientHandler.getHandler();
  }

  if (app['enable'].indexOf(constx.MODULE_TYPE.doctor) !== -1) {
    logger.info("webService enable doctor module now");
    handler[constx.MODULE_TYPE.doctor] = doctorHandler.getHandler();
  }
};