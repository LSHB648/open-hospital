var async = require('async');
var constx = require('../util/constx');
var response = require('../util/response');
var redisService = require('../dao/redisService');
var cookieService = require('./cookieService');
var patientHandler = require('./patientHandler');
var userDao = require('../dao/userDao');
var adminHandler = require('./adminHandler');
var logger = require('../log/logger').getLogger('main');

var doctorHandler = module.exports;
var handler = {};

doctorHandler.getHandler = () => {
  handler[constx.ACTION.getUser] = patientHandler.getUser;
  handler[constx.ACTION.logIn] = adminHandler.logIn;
  handler[constx.ACTION.logOut] = adminHandler.logOut;
  handler[constx.ACTION.getDepartment] = adminHandler.getDepartment;
  handler[constx.ACTION.listDepartment] = adminHandler.listDepartment;
  handler[constx.ACTION.listSchedule] = listSchedule;
  handler[constx.ACTION.getGuide] = getGuide;
  handler[constx.ACTION.listRegistration] = listRegistration;
  handler[constx.ACTION.callRegistration] = callRegistration;
  handler[constx.ACTION.addPrescription] = addPrescription;
  handler[constx.ACTION.listPrescription] = listPrescription;
  handler[constx.ACTION.addCharge] = addCharge;

  return handler;
};

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