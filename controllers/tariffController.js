var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/tariff');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function TariffController(){
  BaseController.call(this, model);
  this.api = 'tariff';
}

TariffController.prototype.getTariff = function(clientId, destinationId){
   return this.model.findOne({client: objectId(clientId), destination: objectId(destinationId)}).exec();
}

util.inherits(TariffController, BaseController);
module.exports = new TariffController();
