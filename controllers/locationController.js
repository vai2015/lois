var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/location');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function LocationController(){
   BaseController.call(this, model);
   this.api = 'location';
};

LocationController.prototype.setParameters = function(query){
    var parameters = {"conditions": {}};

    if(query['name'])
       parameters['conditions']['name'] = new RegExp(query['name'], 'i');

    if(query['region'])
       parameters['conditions']['region'] = query['region'];

    if(query['limit'])
       parameters['limit'] = query['limit'];

    if(query['skip'])
       parameters['skip'] = query['skip'];

    return parameters;
};

util.inherits(LocationController, BaseController);
module.exports = new LocationController();
