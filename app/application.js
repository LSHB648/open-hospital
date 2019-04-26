var fs = require('fs');
var path = require('path');
var constx = require('./util/constx');
var logger = require('./log/logger').getLogger('main');

var app = module.exports;
var allowModules = [constx.MODULE_TYPE.admin, constx.MODULE_TYPE.patient, constx.MODULE_TYPE.doctor];

app.loadConfig = (key, cfg) => {
  var env = app['env'];
  var f = path.join(app['base'], 'config', env, path.basename(cfg));
  
  if (fs.existsSync(f)) {
    var file = require(f);
    app[key] = file;
    return true;

  } else {
    logger.error('loadConfig configuration file path: %s not found', f);
    return false;
  }
};

app.init = () => {
  var args = __getOptions(process.argv);

  if (args.help) {
    app['help'] = true;
    logger.info("__getOptions help found");
    return true;
  }

  if (args.env === undefined) {
    logger.error("__getOptions no env= found");
    return false;
  }

  if (args.listenPort === undefined) {
    logger.error("__getOptions no listenPort= found");
    return false;
  }

  if (args.enable === undefined) {
    logger.error("__getOptions no enable= found");
    return false;
  }

  if (isNaN(parseInt(args.listenPort))) {
    logger.error("__getOptions listenPort must be int");
    return false;
  }

  var modules = args.enable.split(',');
  for (var m of modules) {
    if (allowModules.indexOf(m) === -1) {
      logger.error("Invalid enabled module: %s.", m);
      return false;
    }
  }

  app['main'] = args.main;
  app['env'] = args.env;
  app['listenPort'] = parseInt(args.listenPort);
  app['enable'] = modules;
  app['base'] = path.dirname(require.main.filename);

  return true;
};

function __getOptions(args) {
  var argsMap = {};
  var appPos = 1;

  // node command arguments
  while (args[appPos].indexOf('--') > 0) {
    appPos++;
  }

  // app.js command
  argsMap.main = args[appPos];
  
  // app.js command arguments
  for (var i = (appPos + 1); i < args.length; i++) {
    var arg = args[i];
    var sep = arg.indexOf('=');
    if (sep === -1) {
      argsMap[arg] = true;
      continue;
    }

    var key = arg.slice(0, sep);
    var value = arg.slice(sep + 1);
    argsMap[key] = value;
  }

  return argsMap;
}