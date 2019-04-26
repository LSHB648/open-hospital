var constx = require('../util/constx');
var logger = require('../log/logger').getLogger('main');

var adminHandler = module.exports;
var handler = {};

adminHandler.getHandler = () => {
  return handler;
};