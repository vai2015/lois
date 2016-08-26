var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/trainType');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function TrainTypeController(){
   TrainTypeController.super_.call(this, model);
};

TrainTypeController.api = 'trainType';


util.inherits(TrainTypeController, BaseController);

TrainTypeController.prototype.getParameters = function(query){
    var parameters = {"conditions": {}};

    if(query['name'])
       parameters['conditions']['name'] = new RegExp(query['name'], 'i');

    if(query['limit'])
       parameters['limit'] = query['limit'];

    if(query['skip'])
       parameters['skip'] = query['skip'];

    return parameters;
};

module.exports = TrainTypeController;
