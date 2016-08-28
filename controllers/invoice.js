var mongoose = require('mongoose');
var model = require('../models/shipping');
var invoiceModel = require('../models/invoice');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

function Controller(){}

Controller.prototype.getParameters = function(query){
   var parameters = {"conditions": {"confirmed": true, "inputLocation": query['defaultLocation']}};

   parameters['limit'] = query['limit'] ? query['limit'] : 10;
   parameters['skip'] = query['skip'] ? query['skip'] : 0;

   if(query['spbNumber'])
     parameters['conditions']['spbNumber'] = new RegExp(query['spbNumber'], 'i');

   if(query['sender'])
     parameters['conditions']['sender'] = objectId(query['sender']);

   if(query['destination'])
     parameters['conditions']['destination'] = objectId(query['destination']);

   return parameters;
};

Controller.prototype.getAll = function(parameters){
  var find = model.find(parameters.conditions);

  if(parameters['limit'] && (parameters['skip'] || parameters['skip'] == 0))
    find = find.skip(parameters['skip']).limit(parameters['limit']);

  return find.sort({"number": -1}).populate('sender').populate('destination').populate('payment.type').lean().exec();
};

Controller.prototype.getList = function(query){
  var parameters = {"conditions": {}};

  parameters['limit'] = query['limit'] ? query['limit'] : 10;
  parameters['skip'] = query['skip'] ? query['skip'] : 0;

  return invoiceModel.find(parameters['conditions']).populate('shippings.shipping').sort({"inc" : - 1}).limit(parameters['limit'])
                     .skip(parameters['skip']).lean().exec();
}

Controller.prototype.create = function(viewModels, user){
   var self = this;
   var currentDate = new Date();

   return co(function*(){
       var latestInvoice = yield invoiceModel.findOne({}).sort({"inc": -1}).exec();
       var inc = 1;

       if(latestInvoice)
         inc = latestInvoice.inc + 1;

       var invoice = {
          "number": inc + "/LSAN/KW/" + currentDate.getFullYear(),
          "inc": inc,
          "to": viewModels[0].to,
          "location": viewModels[0].location,
          "type": viewModels[0].type,
          "shippings": []
       };

       yield* _co.coEach(viewModels, function*(viewModel){
           var shipping = yield model.findOne({_id: viewModel.shippingId});

           if(!shipping)
             return;

           if(shipping.invoice.all !== null)
             return;

           invoice.shippings.push(viewModel.shippingId);

           invoice.type === 'Semua' ? shipping.invoice.all = invoice.number : invoice.type === 'Klien' ?
                                      shipping.invoice.client = invoice.number :
                                      shipping.invoice.partner = invoice.number;

           yield shipping.save();
       });

       return new invoiceModel(invoice).save();
   });
};

module.exports = new Controller();
