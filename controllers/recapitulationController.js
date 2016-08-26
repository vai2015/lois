var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/shipping');
var _ = require('lodash');
var co = require('co');
var _co = require('co-lodash');
var BaseController = require('./baseController');
var objectId = mongoose.Types.ObjectId;

var BELUM_TEREKAP = 'Belum Terekap';
var TEREKAP = 'Terekap';
var TEREKAP_SEBAGIAN = 'Terekap Sebagian';
var TERKIRIM_SEBAGIAN = 'Terkirim Sebagian';

function RecapitulationController(){
   BaseController.call(this, model);
   this.api = 'recapitulation';
   this.user = null;
};

RecapitulationController.prototype.setUser = function(user){
   this.user = user;
};

RecapitulationController.prototype.getAll = function(query){
   var matches = {
     "inputLocation" : objectId(this.user.location._id),
     "items.colli.available" : {"$gt": 0}
   };

   if(query['spbNumber'])
     parameters['matches']['spbNumber'] = {$regex: new RegExp(query.spbNumber, 'i')};
   if(query['destination'])
     parameters['matches']['destination'] = objectId(query['destination']);
   if(query['regionDest'])
     parameters['matches']['regions.destination'] = objectId(query['regionDest']);
   if(query['regionSource'])
     parameters['matches']['regions.source'] = objectId(query['regionSource']);

   var limit = 10;
   var skip = 0;

   return this.model.aggregate([
      {$unwind: '$items'},
      {$match: matches},
      {sort: {"numbers" : - 1}},
      {skip: skip},
      {limit: limit}
   ]).exec();
};

RecapitulationController.prototype.getAllCancel = function(query){
   var matches = {
      "inputLocation": objectId(this.user.location._id),
      "items.recapitulations.available": {$gt: 0}
   },

   if(query['spbNumber'])
     parameters['matches']['spbNumber'] = {$regex: new RegExp(query.spbNumber, 'i')};
   if(query['destination'])
     parameters['matches']['destination'] = objectId(query['destination']);
   if(query['regionDest'])
     parameters['matches']['regions.destination'] = objectId(query['regionDest']);
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

RecapitulationController.prototype.recap = function(viewModels){
  var self = this;
  return co(function*(){
     yield* _co.coEach(viewModels, function*(viewModel){
         viewModel.quantity = _.parseInt(viewModel.quantity);

         if(viewModel.quantity === 0)
           return;

         var shipping = yield self.get(viewModel.shippingId);

         if(!shipping)
            return;

         var item = _.find(shipping.items, function(item){
            return item._id.toString() === viewModel.itemId.toString()
         });

         if(!item)
           return;

         if(viewModel.quantity > item.colli.available)
            viewModel.quantity = item.colli.available;

         item.colli.available -= viewModel.quantity;

         item.status = TEREKAP_SEBAGIAN;

         if(item.status === TERKIRIM_SEBAGIAN)
           item.status = TERKIRIM_SEBAGIAN;

         else if(item.colli.available === 0)
           item.status = TEREKAP;

         var recapitulation = {
            "quantity": viewModel.quantity,
            "available": viewModel.quantity,
            "weight": (item.dimensions.weight / item.colli.quantity) * viewModel.quantity,
            "trainType": objectId(viewModel.trainTypeId),
            "limasColor": viewModel.limasColor,
            "relationColor": viewModel.relationColor,
            "notes": viewModel.notes,
            "driver": objectId(viewModel.driverId),
            "vehicleNumber": viewModel.vehicleNumber,
            "departureDate": new Date(viewModel.departureDate),
            "created": {"user": self.user._id, "date": new Date()},
            "modified": {"user": self.user._id, "date": new Date()}
         };

         item.recapitulations.push(recapitulation);
         yield self.update(shipping);
     });
  });
};

RecapitulationController.prototype.cancelRecap = function(viewModels){
  var self = this;

  return co(function*(){
     yield* _co.coEach(viewModels, function*(viewModel){
        viewModel.quantity = _.parseInt(viewModel.quantity);

        if(viewModel.quantity === 0)
           return;

         var shipping = yield self.get(viewModel.shippingId);

         if(!shipping)
           return;

         var item = _.find(shipping.items, function(item){
            return item._id.toString() === viewModel.itemId.toString()
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
         recapitulation.quantity -= viewModel.quantity;
         recapitulation.available -= viewModel.quantity;
         recapitulation.weight = (item.dimensions.weight/item.colli.quantity) * recapitulation.available;
         recapitulation.modified.user = self.user._id;

         item.status = item.colli.available === item.colli.quantity ? BELUM_TEREKAP : TEREKAP_SEBAGIAN;

         yield self.update(shipping);
     });
  });
};

util.inherits(RecapitulationController, BaseController);
module.exports = new RecapitulationController();
