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

function registerUser(req, cb) {
  return;
}

function deRegisterUser(req, cb) {
  return;
}

function listUser(req, cb) {
  return;
}

function logIn(req, cb) {
  return;
}

function logOut(req, cb) {
  return;
}

function registerDepartment(req, cb) {
  return;
}

function deRegisterDepartment(req, cb) {
  return;
}

function getDepartment(req, cb) {
  return;
}

function editDepartment(req, cb) {
  return;
}

function listDepartment(req, cb) {
  return;
}

function addDoctor(req, cb) {
  return;
}

function removeDoctor(req, cb) {
  return;
}

function addSchedule(req, cb) {
  return;
}

function removeSchedule(req, cb) {
  return;
}

function listSchedule(req, cb) {
  return;
}

function editGuide(req, cb) {
  return;
}

function getGuide(req, cb) {
  return;
}