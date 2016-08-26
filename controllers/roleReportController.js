var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/roleReport');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function RoleReportController(){
   RoleReportController.super_.call(this, model);
};

RoleReportController.api = 'roleReport';

util.inherits(RoleReportController, BaseController);

RoleReportController.prototype.getParameters = function(query){
    var parameters = {"conditions": {}};

    if(query['name'])
       parameters['conditions']['name'] = new RegExp(query['name'], 'i');

    if(query['role'])
       parameters['conditions']['role'] = query['role'];

    if(query['limit'])
       parameters['limit'] = query['limit'];

    if(query['skip'])
       parameters['skip'] = query['skip'];

    return parameters;
};

module.exports = RoleReportController;
