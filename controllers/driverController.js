var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/driver');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function DriverController(){
   DriverController.super_.call(this, model);
};

DeliveryController.api = 'driver';

util.inherits(DriverController, BaseController);

DriverController.prototype.setParameters = function(query){
    var parameters = {"conditions": {}};

    if(query['name'])
       parameters['conditions']['name'] = new RegExp(query['name'], 'i');

    if(query['limit'])
       parameters['limit'] = query['limit'];

    if(query['skip'])
       parameters['skip'] = query['skip'];

    return parameters;
};

module.exports = DriverController;
