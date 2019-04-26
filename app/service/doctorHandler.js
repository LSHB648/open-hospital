var constx = require('../util/constx');
var logger = require('../log/logger').getLogger('main');

var doctorHandler = module.exports;
var handler = {};

doctorHandler.getHandler = () => {
  handler[constx.ACTION.getUser] = getUser;
  handler[constx.ACTION.logIn] = logIn;
  handler[constx.ACTION.logOut] = logOut;
  handler[constx.ACTION.getDepartment] = getDepartment;
  handler[constx.ACTION.listDepartment] = listDepartment;
  handler[constx.ACTION.listSchedule] = listSchedule;
  handler[constx.ACTION.getGuide] = getGuide;
  handler[constx.ACTION.listRegistration] = listRegistration;
  handler[constx.ACTION.callRegistration] = callRegistration;
  handler[constx.ACTION.addPrescription] = addPrescription;
  handler[constx.ACTION.listPrescription] = listPrescription;
  handler[constx.ACTION.addCharge] = addCharge;

  return handler;
};

function getUser(req) {
  return;
}

function logIn(req) {
  return;
}

function logOut(req) {
  return;
}

function getDepartment(req) {
  return;
}

function listSchedule(req) {
  return;
}

function getGuide(req) {
  return;
}

function listRegistration(req) {
  return;
}

function callRegistration(req) {
  return;
}

function addPrescription(req) {
  return;
}

function listPrescription(req) {
  return;
}

function addCharge(req) {
  return;
}