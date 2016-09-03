var mongoose = require('mongoose');
var model = require('../models/shipping');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

var BELUM_TERBAYAR = 'Belum Terbayar';
var TERBAYAR_SEBAGIAN = 'Terbayar Sebagian';
var TERBAYAR = 'Terbayar';

function Controller(){}

Controller.prototype.getParameters = function(query){
    var parameters = {"conditions" : {"inputLocation": query['defaultLocation']}};

    parameters['limit'] = query['limit'] ? query['limit'] : 10;
    parameters['skip'] = query['skip'] ? query['skip'] : 0;

    if(query['spbNumber'])
      parameters['conditions']['spbNumber'] = {$regex: new RegExp(query.spbNumber, 'i')};

    if(query['sender'])
      parameters['conditions']['sender'] = objectId(query['sender']);

    if(query['destination'])
      parameters['conditions']['destination'] = objectId(query['destination']);

    if(query['paymentType'])
      parameters['conditions']['payment.type'] = objectId(query['paymentType']);

    if(query['partner'])
      parameters['conditions']['partner'] = objectId(query['partner']);

    if(query['regionDest'])
      parameters['conditions']['regions.destination'] = objectId(query['regionDest']);

    if(query['regionSource'])
      parameters['conditions']['regions.source'] = objectId(query['regionSource']);

    if(query['from'] && query['to']){
      var fromShipping = query['from'];
      var toShipping = query['to'];
      parameters['conditions']['date'] = {"$gte" : new Date(fromShipping), "$lte": new Date(toShipping)};
    }

    return parameters;
};

Controller.prototype.getAll = function(parameters){
  var find = model.find(parameters.conditions);

  if(parameters['limit'] && (parameters['skip'] || parameters['skip'] == 0))
    find = find.skip(parameters['skip']).limit(parameters['limit']);

  return find.sort({"number": -1}).populate('payment.type').lean().exec();
};

Controller.prototype.pay = function(viewModels, user){
   var self = this;

   return co(function* (){
       yield* _co.coEach(viewModels, function*(viewModel){

         var shipping = yield model.findOne({_id: viewModel.shippingId});

         if(!shipping)
            return;

         if(parseFloat(viewModel.amount) == 0)
            return;

         var previousStatus = shipping.payment.status;
         var totalPaid = shipping.payment.paid + parseFloat(viewModel.amount);

         if(totalPaid >= shipping.cost.total)
            shipping.payment.status = TERBAYAR;
         else if(totalPaid > 0)
            shipping.payment.status = TERBAYAR_SEBAGIAN;
         else if(totalPaid <= 0)
            shipping.payment.status = BELUM_TERBAYAR;

         if(previousStatus === TERBAYAR && (shipping.payment.status !== previousStatus)){
            shipping.payment.status = previousStatus;
            shipping.audited = true;

            var notes = 'Perubahan status dari ' + previousStatus + ' ke ' + shipping.payment.status + ' dengan perubahan harga ' +
                         viewModel.amount;

            yield shipping.save();
            yield self.audit(viewModel,notes, user);
            return;
         }

         shipping.payment.phases.push({
             transferDate: new Date(viewModel.transferDate),
             date: new Date(),
             bank: viewModel.bank,
             notes: viewModel.notes,
             amount: parseFloat(viewModel.amount)
         });

         shipping.payment.paid = totalPaid;
         shipping.audited = false;
         shipping.payment.type = objectId(viewModel.paymentTypeId);
         shipping.save();
       });
   });
};

Controller.prototype.audit = function(viewModel, notes, user){
  viewModel.date = new Date();
  
  var audit = new require('../models/audit')({
     type: 'payment',
     notes: notes,
     date: new Date(),
     data: viewModel,
     user: user._id
   });

   return audit.save();
}

module.exports = new Controller();
