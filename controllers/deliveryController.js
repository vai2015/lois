var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/shipping');
var _ = require('lodash');
var co = require('co');
var _co = require('co-lodash');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

var TEREKAP = 'Terekap';
var TEREKAP_SEBAGIAN = 'Terekap Sebagian';
var TERKIRIM = 'Terkirim';
var TERKIRIM_SEBAGIAN = 'Terkirim Sebagian';

function DeliveryController(){
   BaseController.call(this, model);
   this.api = 'delivery';
   this.user = null;
};

DeliveryController.prototype.setUser = function(user){
   this.user = user;
};

DeliveryController.prototype.getAll = function(query){
  var matches = {
     "regions.destination":  objectId(this.user.location.region),
     "items.recapitulations.available": {$gt: 0}
  },

  if(query['regionDest'])
    parameters['matches']['regions.destination'] = objectId(query['regionDest']);
  if(query['spbNumber'])
    parameters['matches']['spbNumber'] = {$regex: new RegExp(query.spbNumber, 'i')};
  if(query['destination'])
    parameters['matches']['destination'] = objectId(query['destination']);
  if(query['regionSource'])
    parameters['matches']['regions.source'] = objectId(query['regionSource']);

  var limit: 10;
  var skip = 10;

  return this.model.aggregate([{
     {$unwind: "$items"},
     {$unwind: "$items.recapitulations"},
     {$match: matches},
     {sort: {"numbers" : - 1}},
     {skip: skip},
     {limit: limit}
  }]).exec();
};

DeliveryController.prototype.getAllCancel = function(query){
  var matches = {
     "regions.destination":  objectId(this.user.location.region),
     "items.deliveries.available": {$gt: 0}
  },

  if(query['regionDest'])
    parameters['matches']['regions.destination'] = objectId(query['regionDest']);
  if(query['spbNumber'])
    parameters['matches']['spbNumber'] = {$regex: new RegExp(query.spbNumber, 'i')};
  if(query['destination'])
    parameters['matches']['destination'] = objectId(query['destination']);
  if(query['regionSource'])
    parameters['matches']['regions.source'] = objectId(query['regionSource']);

  var limit: 10;
  var skip = 10;

  return this.model.aggregate([{
     {$unwind: "$items"},
     {$unwind: "$items.deliveries"},
     {$match: matches},
     {sort: {"numbers" : - 1}},
     {skip: skip},
     {limit: limit}
  }]).exec();
};

DeliveryController.prototype.deliver = function(viewModels){
  var self = this;
  return co(function*(){
     yield* _co.coEach(viewModels, function*(viewModel){
        viewModel.quantity = _.parseInt(viewModel.quantity);

        if(viewModel.quantity === 0)
          return;

         var shipping = yield self.get({_id: viewModel.shippingId});

         if(!shipping)
           return;

         var item = _.find(shipping.items, function(item){
           return item._id.toString() === viewModel.itemId.toString();
         });

         if(!item || item.colli.quantity === 0)
           return;

         var recapitulation = _.find(item.recapitulations, function(recapitulation){
            return recapitulation._id.toString() === viewModel.recapitulationId.toString();
         });

         if(!recapitulation || recapitulation.available === 0)
           return;

         if(viewModel.quantity > recapitulation.available)
           viewModel.quantity = recapitulation.available;

         recapitulation.available -= viewModel.quantity;
         item.colli.delivered += viewModel.quantity;
         item.colli.delivered === item.colli.quantity ? item.status = TERKIRIM : item.status = TERKIRIM_SEBAGIAN;

         var delivery = {
            "quantity": viewModel.quantity,
            "available": viewModel.quantity,
            "weight": (item.dimensions.weight / item.colli.quantity) * viewModel.quantity,
            "trainType": objectId(viewModel.trainTypeId),
            "limasColor": viewModel.limasColor,
            "relationColor": viewModel.relationColor,
            "notes": viewModel.notes,
            "driver": objectId(viewModel.driverId),
            "vehicleNumber": viewModel.vehicleNumber,
            "deliveryCode": viewModel.deliveryCode,
            "created": {"user": self.user._id, "date": new Date()},
            "modified": {"user": self.user._id, "date": new Date()}
         };

         item.deliveries.push(delivery);
         yield self.save(shipping);
     });
  });
};

DeliveryController.prototype.cancelDeliver = function(viewModels){
  var self = this;
  return co(function*(){
     yield* _co.coEach(viewModels, function*(viewModel){
        viewModel.quantity = _.parseInt(viewModel.quantity);

        if(viewModel.quantity === 0)
          return;

        var shipping = yield self.get({_id: viewModel.shippingId});

        if(!shipping)
          return;

        var item = _.find(shipping.items, function(item){
          return item._id.toString() === viewModel.itemId.toString();
        });

        if(!item || item.colli.quantity === 0)
           return;

        var recapitulation = _.find(item.recapitulations, function(recapitulation){
            return recapitulation._id.toString() === delivery.recapitulation.toString();
        });

        if(!recapitulation)
          return;

        var delivery = _.find(item.deliveries, function(delivery){
          return delivery._id.toString() === viewModel.deliveryId.toString();
        });

        if(!delivery  || delivery.available === 0)
         return;

        if(viewModel.quantity > delivery.available)
          viewModel.quantity = delivery.available;

         item.colli.delivered -= viewModel.quantity;
         recapitulation.available += viewModel.quantity;
         delivery.available -= viewModel.quantity;
         delivery.quantity -= viewModel.quantity;
         delivery.weight = (item.dimensions.weight / item.colli.quantity) *  viewModel.quantity;
         delivery.modified.user = self.user._id;

         item.status = item.colli.delivered > 0 ? TERKIRIM_SEBAGIAN : item.colli.available === 0 ? TEREKAP : TEREKAP_SEBAGIAN;

         yield self.save(shipping);
     });
  });
};

util.inherits(DeliveryController, BaseController);
module.exports = new DeliveryController();
