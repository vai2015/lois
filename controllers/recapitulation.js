var mongoose = require('mongoose');
var model = require('../models/shipping');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

var BELUM_TEREKAP = 'Belum Terekap';
var TEREKAP = 'Terekap';
var TEREKAP_SEBAGIAN = 'Terekap Sebagian';
var TERKIRIM_SEBAGIAN = 'Terkirim Sebagian';

function Controller(){}

Controller.api = 'recapitulation';

Controller.prototype.getAll = function(query){
   var limit = query['limit'] ? query['limit'] : 10;
   var skip = query['skip'] ? query['skip'] : 0;

   var shippingMatches = {"inputLocation": objectId(query['defaultLocation'])};

   if(query['spbNumber'])
     shippingMatches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

   if(query['regionDest'])
     shippingMatches['regions.destination'] = objectId(query['regionDest']);

   if(query['regionSource'])
     shippingMatches['regions.source'] = objectId(query['regionSource']);

   if(query['destination'])
     shippingMatches['destination'] = objectId(query['destination']);

   if(query['from'] && query['to']){
      var fromShipping = query['from'];
      var toShipping = query['to'];
      shippingMatches['date'] = {"$gte" : new Date(fromShipping), "$lte": new Date(toShipping)};
   }

   return model.aggregate([
    {$match: shippingMatches},
    {$match: {"items.colli.available": {"$gt": 0}}},
	  {$sort : {"number" : -1}},
    {$unwind: "$items"},
    {$skip: skip},
    {$limit: limit}
   ]).exec();
};

Controller.prototype.getAllCancel = function(query){
  var limit = query['limit'] ? query['limit'] : 10;
  var skip = query['skip'] ? query['skip'] : 0;

  var shippingMatches = {"inputLocation": objectId(query['defaultLocation'])};

  if(query['spbNumber'])
    shippingMatches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

  if(query['regionDest'])
    shippingMatches['regions.destination'] = objectId(query['regionDest']);

  if(query['regionSource'])
    shippingMatches['regions.source'] = objectId(query['regionSource']);

  if(query['destination'])
    shippingMatches['destination'] = objectId(query['destination']);

  if(query['from'] && query['to']){
     var fromShipping = new Date(query['from']);
     var toShipping = new Date(query['to']);
     shippingMatches['date'] = {"$gte" : new Date(fromShipping.toISOString()), "$lte": new Date(toShipping.toISOString())};
  }

  return model.aggregate([
   {$match: shippingMatches},
   {$match: {"items.recapitulations": {"$elemMatch": {"available": {"$gt": 0}}}}},
   {$sort : {"number" : -1}},
   {$unwind: "$items"},
   {$unwind: "$items.recapitulations"},
   {$skip: skip},
   {$limit: limit}
  ]).exec();
};

Controller.prototype.recap = function(viewModels, user){
   var self = this;
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

          if(!item || item.colli.available === 0)
            return;

          if(viewModel.quantity > item.colli.available)
            viewModel.quantity = item.colli.available;

          item.colli.available -= viewModel.quantity;

          var recapitulation = {
             "date": new Date(),
             "quantity": viewModel.quantity,
             "available": viewModel.quantity,
             "weight": (item.dimensions.weight / item.colli.quantity) * viewModel.quantity,
             "limasColor": viewModel.limasColor,
             "relationColor": viewModel.relationColor,
             "vehicleNumber": viewModel.vehicleNumber,
             "driver": viewModel.driver,
             "notes": viewModel.notes,
             "trainType": viewModel.trainType,
             "departureDate": new Date(viewModel.departureDate),
             "created": {
                "user": user._id,
                "date": new Date()
             },
             "modified":{ "user": user._id}
          };

          item.recapitulations.push(recapitulation);

          if(item.status === TERKIRIM_SEBAGIAN)
             item.status = TERKIRIM_SEBAGIAN;
          else if(item.colli.available === 0)
             item.status = TEREKAP;
          else
             item.status = TEREKAP_SEBAGIAN;

          yield shipping.save();
      });
   });
};

Controller.prototype.cancelRecap = function(viewModels){
   var self = this;

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

           item.colli.available += viewModel.quantity;
           recapitulation.available -= viewModel.quantity;
           recapitulation.quantity -= viewModel.quantity;
           recapitulation.weight = (item.dimensions.weight / item.colli.quantity) * recapitulation.available;

           if(item.colli.available === item.colli.quantity)
              item.status = BELUM_TEREKAP;
           else
              item.status = TEREKAP_SEBAGIAN;

          yield shipping.save();
      });
   });
};

module.exports = new Controller();
