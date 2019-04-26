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

function getUser(req, cb) {
  return;
}

function logIn(req, cb) {
  return;
}

function logOut(req, cb) {
  return;
}

function getDepartment(req, cb) {
  return;
}

function listSchedule(req, cb) {
  return;
}

function getGuide(req, cb) {
  return;
}

function listRegistration(req, cb) {
  return;
}

function callRegistration(req, cb) {
  return;
}

function addPrescription(req, cb) {
  return;
}

function listPrescription(req, cb) {
  return;
}

function addCharge(req, cb) {
  return;
}