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
     "conditions": {"$and":[{"regions.destination": query['defaultRegionDest']}, {"returned": false},
                   {"items": {"$elemMatch": {"status": {"$all": ["Terkirim"]}}}}]}
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
      var fromShipping = new Date(query['fromShipping']);
      var toShipping = new Date(query['toShipping']);
      parameters['conditions']['date'] = {"$gte" : fromShipping, "$lt": toShipping};
   }

   return parameters;
};

Controller.prototype.getAll = function(parameters){
  var find = model.find(parameters.conditions);

  if(parameters['limit'] && (parameters['skip'] || parameters['skip'] == 0))
    find = find.skip(parameters['skip']).limit(parameters['limit']);

  return find.sort({"number": -1}).lean().exec();
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
         notification.event = 'Retur spb ' + shipping.spbNumber + (viewModel.accepted ? 'diterima' : 'ditolak');
         notification.filePath = shipping.returnInfo.filePath;
         notification.date = new Date();
         notification.user = user._id;

         yield shipping.save();
         yield notification.save();
      });
   });
};

module.exports = new Controller();