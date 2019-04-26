var constx = require('../util/constx');
var logger = require('../log/logger').getLogger('main');

var patientHandler = module.exports;
var handler = {};

patientHandler.getHandler = () => {
  handler[constx.ACTION.registerUser] = registerUser;
  handler[constx.ACTION.getUser] = getUser;
  handler[constx.ACTION.editUser] = editUser;
  handler[constx.ACTION.logIn] = logIn;
  handler[constx.ACTION.logOut] = logOut;
  handler[constx.ACTION.getDepartment] = getDepartment;
  handler[constx.ACTION.listDepartment] = listDepartment;
  handler[constx.ACTION.listSchedule] = listSchedule;
  handler[constx.ACTION.getGuide] = getGuide;
  handler[constx.ACTION.addRegistration] = addRegistration;
  handler[constx.ACTION.removeRegistration] = removeRegistration;
  handler[constx.ACTION.editRegistration] = editRegistration;
  handler[constx.ACTION.listRegistration] = listRegistration;
  handler[constx.ACTION.listPrescription] = listPrescription;
  handler[constx.ACTION.onlinePay] = onlinePay;

  return handler;
};

function registerUser(req, cb) {
  return;
}

function getUser(req, cb) {
  return;
}

function editUser(req, cb) {
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

function addRegistration(req, cb) {
  return;
}

function removeRegistration(req, cb) {
  return;
}

function editRegistration(req, cb) {
  return;
}

function listRegistration(req, cb) {
  return;
}

function listPrescription(req, cb) {
  return;
}

function onlinePay(req, cb) {
  return;
}