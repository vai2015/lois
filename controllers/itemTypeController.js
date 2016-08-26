var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/itemType');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function ItemTypeController(){
   ItemTypeController.super_.call(this, model);
};

ItemTypeController.api = 'itemType';

util.inherits(ItemTypeController, BaseController);

ItemTypeController.prototype.getParameters = function(query){
    var parameters = {"conditions": {}};

    if(query['name'])
       parameters['conditions']['name'] = new RegExp(query['name'], 'i');

    if(query['limit'])
       parameters['limit'] = query['limit'];

    if(query['skip'])
       parameters['skip'] = query['skip'];

    return parameters;
};

module.exports = ItemTypeController;
