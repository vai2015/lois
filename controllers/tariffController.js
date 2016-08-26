var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/tariff');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function TariffController(){
  TrainTypeController.super_.call(this, model);
}

TariffController.api = 'tariff';

util.inherits(TariffController, BaseController);

TariffController.prototype.getTariff = function(clientId, destinationId){
   return this.model.findOne({client: objectId(clientId), destination: objectId(destinationId)}).exec();
}

module.exports = TariffController;
