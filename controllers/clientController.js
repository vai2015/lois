var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/client');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function ClientController(){
  ClientController.super_.call(this, model);
}

ClientController.api = 'client';

util.inherits(ClientController, BaseController);

module.exports = new ClientController();
