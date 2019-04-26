var constx = require('../util/constx');
var logger = require('../log/logger').getLogger('main');

var adminHandler = module.exports;
var handler = {};

adminHandler.getHandler = () => {
  handler[constx.ACTION.registerUser] = registerUser;
  handler[constx.ACTION.deRegisterUser] = deRegisterUser;
  handler[constx.ACTION.listUser] = listUser;
  handler[constx.ACTION.logIn] = logIn;
  handler[constx.ACTION.logOut] = logOut;
  handler[constx.ACTION.registerDepartment] = registerDepartment;
  handler[constx.ACTION.deRegisterDepartment] = deRegisterDepartment;
  handler[constx.ACTION.getDepartment] = getDepartment;
  handler[constx.ACTION.editDepartment] = editDepartment;
  handler[constx.ACTION.listDepartment] = listDepartment;
  handler[constx.ACTION.addDoctor] = addDoctor;
  handler[constx.ACTION.removeDoctor] = removeDoctor;
  handler[constx.ACTION.addSchedule] = addSchedule;
  handler[constx.ACTION.removeSchedule] = removeSchedule;
  handler[constx.ACTION.listSchedule] = listSchedule;
  handler[constx.ACTION.editGuide] = editGuide;
  handler[constx.ACTION.getGuide] = getGuide;

  return handler;
};

function registerUser(req) {
  return;
}

function deRegisterUser(req) {
  return;
}

function listUser(req) {
  return;
}

function logIn(req) {
  return;
}

function logOut(req) {
  return;
}

function registerDepartment(req) {
  return;
}

function deRegisterDepartment(req) {
  return;
}

function getDepartment(req) {
  return;
}

function editDepartment(req) {
  return;
}

function listDepartment(req) {
  return;
}

function addDoctor(req) {
  return;
}

function removeDoctor(req) {
  return;
}

function addSchedule(req) {
  return;
}

function removeSchedule(req) {
  return;
}

function listSchedule(req) {
  return;
}

function editGuide(req) {
  return;
}

function getGuide(req) {
  return;
}