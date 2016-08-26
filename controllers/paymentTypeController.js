var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/paymentType');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

function PaymentTypeController(){
   PaymentTypeController.super_.call(this, model);
};

PaymentTypeController.api = 'paymentType';

util.inherits(PaymentTypeController, BaseController);

PaymentTypeController.prototype.setParameters = function(query){
    var parameters = {"conditions": {}};

    if(query['name'])
       parameters['conditions']['name'] = new RegExp(query['name'], 'i');

    if(query['limit'])
       parameters['limit'] = query['limit'];

    if(query['skip'])
       parameters['skip'] = query['skip'];

    return parameters;
};

module.exports = PaymentTypeController;
