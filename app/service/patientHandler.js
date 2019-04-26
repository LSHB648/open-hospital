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

function registerUser(req) {
  return;
}

function getUser(req) {
  return;
}

function editUser(req) {
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

function addRegistration(req) {
  return;
}

function removeRegistration(req) {
  return;
}

function editRegistration(req) {
  return;
}

function listRegistration(req) {
  return;
}

function listPrescription(req) {
  return;
}

function onlinePay(req) {
  return;
}