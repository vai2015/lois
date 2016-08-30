var mongoose = require('mongoose');
var model = require('../models/audit');
var shippingModel = require('../models/shipping');
var shippingController = require('./shipping');
var co = require('co');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

var BELUM_TERBAYAR = 'Belum Terbayar';
var TERBAYAR_SEBAGIAN = 'Terbayar Sebagian';
var TERBAYAR = 'Terbayar';

function Controller(){}

Controller.api = 'notification';

Controller.prototype.get = function(id){
   return model.findOne({_id: objectId(id)}).exec();
};

Controller.prototype.getParameters = function(query){
  var parameters = {"conditions": {}};

  if(query['name'])
     parameters['conditions']['name'] = new RegExp(query['name'], 'i');

  if(query['limit'])
     parameters['limit'] = query['limit'];

  if(query['skip'] || query['skip'] == 0)
     parameters['skip'] = query['skip'];

   return parameters;
};

Controller.prototype.getAll = function(parameters){
   var find = model.find(parameters.conditions);

   if(parameters['limit'] && (parameters['skip'] || parameters['skip'] == 0))
     find = find.skip(parameters['skip']).limit(parameters['limit']);

   return find.sort({"name": 1}).populate('user', {"salt": 0, "hash": 0}).exec();
};

Controller.prototype.process = function(viewModel){

};

Controller.prototype.approve = function(viewModel){
   var self = this;

   return co(function* (){
       var audit =  yield model.findOne({"_id": objectId(viewModel._id)}).exec();
       var shipping = yield shippingModel.findOne({"_id": objectId(viewModel.data.shippingId)}).exec();

       if(!audit)
         throw new Error('Audit data is not found');

       if(!shipping)
         throw new Error('Shipping is not found');

       switch (viewModel['type']) {
           case "payment":
              yield self.processPayment(viewModel.data, shipping);
             break;
           case "price":
             yield self.processPrice(viewModel.data, shipping);
           break;
       };

       return yield self.delete(audit._id);
   });
};

Controller.prototype.reject = function(viewModel){

};

Controller.prototype.processPayment = function(data, shipping){
    var totalPaid =  _.sumBy(shipping.payment.phases, "amount") + parseFloat(data.amount);

    if(totalPaid >= shipping.cost.total)
       shipping.payment.status = TERBAYAR;
    else if(totalPaid > 0)
       shipping.payment.status = TERBAYAR_SEBAGIAN;
    else if(totalPaid <= 0)
       shipping.payment.status = BELUM_TERBAYAR;

    shipping.payment.phases.push({
        transferDate: new Date(_.parseInt(data.transferDate)),
        date: new Date(_.parseInt(data.date)),
        bank: data.bank,
        notes: data.notes,
        amount: parseFloat(data.amount)
    });

    shipping.payment.paid += parseFloat(data.amount);
    shipping.audited = false;
    shipping.payment.type = objectId(data.paymentTypeId);
    return shipping.save();
};

Controller.prototype.processPrice = function(data, shipping){

};

Controller.prototype.delete = function(id){
   var self = this;
   return co(function*(){
      var model = yield self.get(id);

      if(!model)
        throw new Error('Data is not found');

      return model.remove({_id: objectId(id)});
   });
};

module.exports = new Controller();
