var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/region');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function RegionController(){
   RegionController.super_.call(this, model);
};

RegionController.api = 'region';

util.inherits(RegionController, BaseController);

RegionController.prototype.getParameters = function(query){
    var parameters = {"conditions": {}};

    if(query['name'])
       parameters['conditions']['name'] = new RegExp(query['name'], 'i');

    if(query['limit'])
       parameters['limit'] = query['limit'];

    if(query['skip'])
       parameters['skip'] = query['skip'];

    return parameters;
};

module.exports = RegionController;
