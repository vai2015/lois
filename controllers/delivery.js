var mongoose = require('mongoose');
var model = require('../models/shipping');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

var TEREKAP = 'Terekap';
var TEREKAP_SEBAGIAN = 'Terekap Sebagian';
var TERKIRIM = 'Terkirim';
var TERKIRIM_SEBAGIAN = 'Terkirim Sebagian';

function Controller(){}

Controller.api = 'delivery';

Controller.prototype.getAll = function(query){
    var matches = {"items.recapitulations.available": {"$gt": 0}};
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;

    if(query['spbNumber'])
      matches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if(query['regionDest'])
      matches['regions.destination'] = objectId(query['regionDest']);
    else
      matches['regions.destination'] = objectId(query['defaultRegionDest']);

    if(query['recapDriver'])
      matches['items.recapitulations.driver'] = objectId(query['recapDriver']);

    if(query['recapDate'])
      matches['items.recapitulations.date'] = new Date(query['recapDate']);

    if(query['regionSource'])
      matches['regions.source'] = objectId(query['regionSource']);

    if(query['destination'])
      matches['destination'] = objectId(query['destination']);

    if(query['from'] && query['to']){
       var fromShipping = new Date(query['fromShipping']);
       var toShipping = new Date(query['toShipping']);
       matches['date'] = {"$gte" : fromShipping, "$lt": toShipping};
    }

    return model.aggregate([
       {$unwind: "$items"},
       {$unwind: "$items.recapitulations"},
       {$match: matches}
    ]).skip(skip).limit(limit).sort({"number": -1}).exec();
};

Controller.prototype.getAllCancel = function(query){
  var matches = {"items.deliveries.available": {"$gt": 0}};

  var limit = query['limit'] ? query['limit'] : 10;
  var skip = query['skip'] ? query['skip'] : 0;

  if(query['spbNumber'])
    matches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

  if(query['regionDest'])
    matches['regions.destination'] = objectId(query['regionDest']);
  else
    matches['regions.destination'] = objectId(query['defaultRegionDest']);

  if(query['recapDriver'])
    matches['items.recapitulations'] = {"$elemMatch": {"driver": objectId(query['recapDriver'])}};

  if(query['recapDate'])
    matches['items.recapitulations'] = {"$elemMatch": {"date": new Date(query['recapDate'])}};

  if(query['regionSource'])
    matches['regions.source'] = objectId(query['regionSource']);

  if(query['destination'])
    matches['destination'] = objectId(query['destination']);

  if(query['from'] && query['to']){
     var fromShipping = new Date(query['fromShipping']);
     var toShipping = new Date(query['toShipping']);
     matches['date'] = {"$gte" : fromShipping, "$lt": toShipping};
  }

  return model.aggregate([
     {$unwind: "$items"},
     {$unwind: "$items.deliveries"},
     {$match: matches}
  ]).skip(skip).limit(limit).sort({"number": -1}).exec();
};

Controller.prototype.delivery = function(viewModels, user){
   var shippingController = this.shippingController;

   return co(function*(){
      yield* _co.coEach(viewModels, function*(viewModel){
          viewModel.quantity = _.parseInt(viewModel.quantity);

          if(viewModel.quantity === 0)
            return;

          var shipping = yield model.findOne({_id: objectId(viewModel.shippingId)});

          if(!shipping)
            return;

          var item = _.find(shipping.items, function(item){
             return item._id.toString() === viewModel.itemId.toString();
          });

          if(!item)
            return;

          var recapitulation = _.find(item.recapitulations, function(recapitulation){
              return recapitulation._id.toString() === viewModel.recapitulationId.toString();
          });

          if(!recapitulation || recapitulation.available === 0)
            return;

          if(viewModel.quantity > recapitulation.available)
            viewModel.quantity = recapitulation.available;

          var delivery = {
            "recapitulation": recapitulation._id,
            "date": new Date(),
            "quantity": viewModel.quantity,
            "available": viewModel.quantity,
            "weight": (item.dimensions.weight / item.colli.quantity) * viewModel.quantity,
            "limasColor": viewModel.limasColor,
            "relationColor": viewModel.relationColor,
            "vehicleNumber": viewModel.vehicleNumber,
            "driver": viewModel.driverId,
            "notes": viewModel.notes,
            "created": {
               "user": user._id,
               "date": new Date()
            },
            "modified":{ "user": user._id}
          };

          item.colli.delivered += viewModel.quantity;
          recapitulation.available -= viewModel.quantity;
          shipping.colli.delivered += viewModel.quantity;

          if(item.colli.delivered === item.colli.quantity)
            item.status = TERKIRIM;
          else
            item.status = TERKIRIM_SEBAGIAN;

          item.deliveries.push(delivery);
          yield shipping.save();
      });
   });
};

Controller.prototype.cancelDelivery = function(viewModels, user){
  var shippingController = this.shippingController;

  return co(function*(){
     yield* _co.coEach(viewModels, function*(viewModel){
         viewModel.quantity = _.parseInt(viewModel.quantity);

         if(viewModel.quantity === 0)
           return;

         var shipping = yield model.findOne({_id: objectId(viewModel.shippingId)});

         if(!shipping)
           return;

         var item = _.find(shipping.items, function(item){
            return item._id.toString() === viewModel.itemId.toString();
         });

         if(!item)
           return;

         var delivery = _.find(item.deliveries, function(delivery){
            return delivery._id.toString() === viewModel.deliveryId.toString();
         });

         if(!delivery || delivery.available === 0)
           return;

         var recapitulation = _.find(item.recapitulations, function(recapitulation){
             return recapitulation._id.toString() === delivery.recapitulation.toString();
         });

         if(!recapitulation)
           return;

         if(viewModel.quantity > delivery.available)
           viewModel.quantity = delivery.available;

         item.colli.delivered -= viewModel.quantity;
         shipping.colli.delivered -= viewModel.quantity;
         recapitulation.available += viewModel.quantity;
         delivery.available -= viewModel.quantity;
         delivery.quantity -= viewModel.quantity;
         delivery.weight = (item.dimensions.weight / item.colli.quantity) * delivery.available;

         if(item.colli.delivered > 0)
           item.status = TERKIRIM_SEBAGIAN;
         else if(item.colli.available === 0)
           item.status = TEREKAP;
         else
           item.status = TEREKAP_SEBAGIAN;

         yield shipping.save();
     });
  });
};

module.exports = new Controller();
