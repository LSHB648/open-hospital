var constx = require('../util/constx');
var logger = require('../log/logger').getLogger('main');

var doctorHandler = module.exports;
var handler = {};

doctorHandler.getHandler = () => {
  return handler;
};