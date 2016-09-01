var mongoose = require('mongoose');
var model = require('../models/recapitulation');
var shippingModel = require('../models/shipping');
var shippingItemModel = require('../models/shippingItem');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

var BELUM_TEREKAP = 'Belum Terekap';
var TEREKAP = 'Terekap';
var TEREKAP_SEBAGIAN = 'Terekap Sebagian';
var TERKIRIM_SEBAGIAN = 'Terkirim Sebagian';

function Controller(){}

Controller.prototype.getAll = function(query){
   var limit = query['limit'] ? query['limit'] : 10;
   var skip = query['skip'] ? query['skip'] : 0;

   var matches = {"inputLocation": objectId(query['defaultLocation']), "colli.available": {"$gt": 0}};

   if(query['spbNumber'])
     matches['shipping.spbNumber'] = new RegExp(query['spbNumber'], 'i');

   if(query['regionDest'])
     matches['shipping.regions.destination'] = objectId(query['regionDest']);

   if(query['regionSource'])
     matches['shipping.regions.source'] = objectId(query['regionSource']);

   if(query['destination'])
     matches['shipping.destination'] = objectId(query['destination']);

   if(query['from'] && query['to']){
      var fromShipping = new Date(query['from']);
      var toShipping = new Date(query['to']);
      matches['shipping.date'] = {"$gte" : fromShipping, "$lte": toShipping};
   }

   return shippingItemModel.find(matches)
                           .populate("shipping")
                           .sort({"number": -1})
                           .skip(skip)
                           .limit(limit)
                           .lean()
                           .exec()
}

Controller.prototype.getAllCancel = function(query){
  var limit = query['limit'] ? query['limit'] : 10;
  var skip = query['skip'] ? query['skip'] : 0;

  var matches = {"inputLocation": objectId(query['defaultLocation']), "available": {"$gt": 0}};

  if(query['spbNumber'])
    matches['shipping.spbNumber'] = new RegExp(query['spbNumber'], 'i');

  if(query['regionDest'])
    matches['shipping.regions.destination'] = objectId(query['regionDest']);

  if(query['regionSource'])
    matches['shipping.regions.source'] = objectId(query['regionSource']);

  if(query['destination'])
    matches['shipping.destination'] = objectId(query['destination']);

  if(query['from'] && query['to']){
     var fromShipping = new Date(query['from']);
     var toShipping = new Date(query['to']);
     matches['shipping.date'] = {"$gte" : fromShipping, "$lte": toShipping};
  }

  return model.find(matches)
              .populate('shipping')
              .populate("shippingItem")
              .sort({"number": -1})
              .skip(skip)
              .limit(limit)
              .lean()
              .exec()
}

Controller.prototype.recap = function(viewModels){
   var self = this;

   return co(function* (){
      yield* _co.coEach(viewModels, function*(viewModel){
          viewModel.quantity = _.parseInt(viewModel.quantity);

          if(viewModel.quantity === 0)
            return;

          var shippingItem = yield shippingItemModel.findOne({_id: objectId(viewModel._id)});

          if(!shippingItem)
            return;

          if(viewModel.quantity > item.colli.available)
             viewModel.quantity = item.colli.quantity;

          shippingItem.colli.available -= viewModel.quantity;

          var recapitulation = new model({
             "shipping": viewModel.shipping._id,
             "shippingItem": shippingItem._id,
             "date": new Date(),
             "quantity": viewModel.quantity,
             "available": viewModel.quantity,
             "weight": (shippingItem.dimensions.weight / shippingItem.colli.quantity) * viewModel.quantity,
             "limasColor": viewModel.limasColor,
             "relationColor": viewModel.relationColor,
             "vehicleNumber": viewModel.vehicleNumber,
             "departureDate": new Date(viewModel.departureDate),
             "notes": viewModel.notes,
             "trainType": viewModel.trainType,
             "driver": viewModel.driver,
             "created": {"user": user._id, "date": new Date()},
             "modified": {"user": user._id}
          });

          if(shippingItem.status === TERKIRIM_SEBAGIAN)
             shippingItem.status = TERKIRIM_SEBAGIAN;
          else if(shippingItem.colli.available === 0)
             shippingItem.status = TEREKAP;
          else
             shippingItem.status = TEREKAP_SEBAGIAN;

          yield recapitulation.save();
          yield shippingItem.save();
      });
   });
};

Controller.prototype.cancelRecap = function(viewModels){
   var self = this;

   return co(function* (){
       yield* _co.coEach(viewModels, function*(viewModel){
           viewModel.quantity = _.parseInt(viewModel.quantity);

           if(viewModel.quantity === 0)
             return;

           var shippingItem = yield shippingItemModel.findOne({_id: objectId(viewModel.shippingItem._id)});

           if(!shippingItem)
             return;

           var recapitulation = yield model.findOne({_id: objectId(viewModel._id)});

           if(!recapitulation)
             return;

           shippingItem.colli.available += viewModel.quantity;
           recapitulation.available -= viewModel.quantity;
           recapitulation.quantity -= viewModel.quantity;
           recapitulation.weight = (shippingItem.dimensions.weight / shippingItem.colli.quantity) * viewModel.quantity;

           if(shippingItem.colli.available === shippingItem.colli.quantity)
             shippingItem.status = BELUM_TEREKAP;
           else
             shippingItem.status = TEREKAP_SEBAGIAN;

           yield recapitulation.save();
           yield shippingItem.save();
       });
   });
}

module.exports = new Controller();
