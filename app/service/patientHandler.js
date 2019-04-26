var constx = require('../util/constx');
var logger = require('../log/logger').getLogger('main');

var patientHandler = module.exports;
var handler = {};

patientHandler.getHandler = () => {
  return handler;
};