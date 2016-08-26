var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/packingType');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function PackingTypeController(){
   PackingTypeController.super_.call(this, model);
};

PackingTypeController.api = 'packingType';

util.inherits(PackingTypeController, BaseController);

PackingTypeController.prototype.getParameters = function(query){
    var parameters = {"conditions": {}};

    if(query['name'])
       parameters['conditions']['name'] = new RegExp(query['name'], 'i');

    if(query['limit'])
       parameters['limit'] = query['limit'];

    if(query['skip'])
       parameters['skip'] = query['skip'];

    return parameters;
};

module.exports = PackingTypeController;
