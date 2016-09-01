var mongoose = require('mongoose');
var model = require('../models/shipping');
var notificationModel = require('../models/notification');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

function Controller(){}

Controller.api = 'return';

Controller.prototype.getParameters = function(query){
   var parameters = {
     "conditions": {
       "regions.destination": query['defaultRegionDest']
     }
   };

   parameters['limit'] = query['limit'] ? query['limit'] : 10;
   parameters['skip'] = query['skip'] ? query['skip'] : 0;

   if(query['spbNumber'])
     parameters['conditions']['spbNumber'] = new RegExp(query['spbNumber'], 'i');

   if(query['destination'])
     parameters['conditions']['destination'] = objectId(query['destination']);

   if(query['regionSource'])
     parameters['conditions']['regions.source'] = objectId(query['regionSource']);

   if(query['from'] && query['to']){
      var fromShipping = new Date(query['from']);
      var toShipping = new Date(query['to']);
      parameters['conditions']['date'] = {"$gte" : fromShipping, "$lte": toShipping};
   }

   return parameters;
};

Controller.prototype.getAll = function(query){
  var limit = query['limit'] ? query['limit'] : 10;
  var skip = query['skip'] ? query['skip'] : 0;
  var matches = {"regions.destination": objectId(query['defaultRegionDest'])};

  if(query['spbNumber'])
    matches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

  if(query['destination'])
    matches['destination'] = objectId(query['destination']);

  if(query['regionSource'])
    matches['regions.source'] = objectId(query['regionSource']);

  if(query['from'] && query['to']){
     var fromShipping = new Date(query['from']);
     var toShipping = new Date(query['to']);
     matches['date'] = {"$gte" : fromShipping, "$lte": toShipping};
  }

  return model.aggregate([
     {$match: matches},
     {$match: {"items": {$elemMatch: {"status": "Terkirim"}}}},
     {$unwind: "$items"},
     {$match: {"items.status": "Terkirim"}},
     {$group: {_id: "$_id", shipping: {$push: "$$ROOT"}}},
     {$skip: skip},
     {$limit: limit}]).exec();
};

Controller.prototype.getConfirmReturns = function(query){
  var parameters = {"inputLocation": query['defaultLocation'], "returned": true, "confirmed": false};

  var limit = query['limit'] ? query['limit'] : 10;
  var skip = query['skip'] ? query['skip'] : 0;

  if(query['spbNumber'])
    parameters['spbNumber'] = new RegExp(query['spbNumber'], 'i');

  if(query['regionDest'])
    parameters['regions.destination'] = objectId(query['regionDest']);

  if(query['destination'])
    parameters['destination'] = objectId(query['destination']);

  if(query['returnDate'])
    parameters['returnInfo.date'] = new Date(query['returnDate']);

  if(query['from'] && query['to']){
     var fromShipping = new Date(query['fromShipping']);
     var toShipping = new Date(query['toShipping']);
     parameters['date'] = {"$gte" : fromShipping, "$lt": toShipping};
  }

  return model.find(parameters).sort({"number": -1}).skip(skip).limit(limit).lean().exec();
};

Controller.prototype.return = function(viewModels, user){
   var self = this;

   return co(function* (){
      yield* _co.coEach(viewModels, function*(viewModel){
         var shipping = yield model.findOne({_id: objectId(viewModel.shippingId)});

         if(!shipping)
           return;

         shipping.returnInfo = {
           date: new Date(),
           filePath: viewModel.filePath ? viewModel.filePath : null,
           stamped: viewModel.stamped ? true : false,
           signed: viewModel.signed ? true : false,
           receipt: viewModel.receipt ? true : false,
           accepted: viewModel.accepted ? true : false,
           limasColor: viewModel.limasColor,
           relationColor: viewModel.relationColor,
           relationCode: viewModel.relationCode,
           notes: viewModel.notes,
           concernedPerson: viewModel.concernedPerson,
           created: user._id
         };

         shipping.returned = true;

         var notification = new notificationModel();
         notification.event = 'Retur spb ' + shipping.spbNumber + ' ' + (viewModel.accepted ? 'diterima' : 'ditolak');
         notification.filePath = shipping.returnInfo.filePath;
         notification.date = new Date();
         notification.user = user._id;

         yield shipping.save();
         yield notification.save();
      });
   });
};

Controller.prototype.confirm = function(viewModels){
   var self = this;

   return co(function*(){
       yield* _co.coEach(viewModels, function*(viewModel){
         var shipping = yield model.findOne({_id: objectId(viewModel._id)});

         if(!shipping)
           return;

         shipping.confirmed = true;

         yield shipping.save();
       });
   });
};

module.exports = new Controller();
