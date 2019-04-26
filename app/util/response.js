var util = require('util');
var constx = require('../util/constx');
var logger = require('../log/logger').getLogger('main');

var response = module.exports;

response.getJson = (req, code) => {
  var res = {};
  res['Category'] = req.category || constx.RES_CATEGORY.response;
  res['Action'] = req.action || "";
  res['Code'] = code;

  switch (code) {
    case 200:
      res['Message'] = constx.ERR_MSG[code.toString()];
      break;

    case 401:
      res['Message'] = constx.ERR_MSG[code.toString()];
      break;

    case 402:
      res['Message'] = util.format(constx.ERR_MSG[code.toString()], req.action || "");
      break;

    case 403:
      res['Message'] = util.format(constx.ERR_MSG[code.toString()], req.paraName || "");
      break;

    case 404:
      res['Message'] = util.format(constx.ERR_MSG[code.toString()], req.paraVal || "", req.paraName || "");
      break;

    case 405:
      res['Message'] = util.format(constx.ERR_MSG[code.toString()], req.resource || "");
      break;

    case 406:
      res['Message'] = util.format(constx.ERR_MSG[code.toString()], req.rid || "");
      break;

    case 407:
      res['Message'] = constx.ERR_MSG[code.toString()];
      break;

    case 408:
      res['Message'] = constx.ERR_MSG[code.toString()];
      break;

    case 409:
      res['Message'] = constx.ERR_MSG[code.toString()];
      break;

    case 410:
      res['Message'] = constx.ERR_MSG[code.toString()];
      break;
    
    case 411:
      res['Message'] = constx.ERR_MSG[code.toString()];
      break;

    default:
      logger.error("response get unkown code = %d", code);
      res = response.getJson(req, 407);
  }

  return res;
};

response.getStr = (req, code) => {
  var res = response.getJson(req, code);

  return JSON.stringify(res);
};