var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/role');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function RoleController(){
   RoleController.super_.call(this, model);
};

RoleController.api = 'role';

util.inherits(RoleController, BaseController);

RoleController.prototype.getParameters = function(query){
    var parameters = {"conditions": {}};

    if(query['name'])
       parameters['conditions']['name'] = new RegExp(query['name'], 'i');

    if(query['limit'])
       parameters['limit'] = query['limit'];

    if(query['skip'])
       parameters['skip'] = query['skip'];

    return parameters;
};

module.exports = RoleController;
