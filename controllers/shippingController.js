var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/shipping');
var BaseController = require('./baseController');
var TariffController = require('./tariffController');
var objectId = mongoose.Types.ObjectId;

var DEFAULT_LOCATION_ID = "";
var DEFAULT_CLIENT_ID = "";
var DEFAULT_REGION_ID = "";
var DEFAULT_PAYMENT_TYPE_ID = "";
var DEFAULT_PARTNER_ID = "";
var ITEM_TYPE_WEIGHT = "";
var ITEM_TYPE_VOLUME = "";

function ShippingController(){
  ShippingController.super_.call(this, model);
  this.user = null;
  this.tariffController = new TariffController();
}

ShippingController.api = 'shipping';

util.inherits(ShippingController, BaseController);

ShippingController.prototype.setUser = function(user){
  this.user = user;
};

ShippingController.prototype.getParameters = function(query){
  var parameters = {"conditions": {}, "limit": 10, "skip": 0};

  if(query['spbNumber'])
    parameters['conditions']['spbNumber'] = new RegExp(query['spbNumber'], 'i');
  if(query['receiverName'])
    parameters['conditions']['receiver.name'] = new RegExp(query['receiverName'], 'i');
  if(query['sender'])
    parameters['conditions']['sender'] = query['sender'];
  if(query['destination'])
    parameters['conditions']['destination'] = query['destination'];
  if(query['paymentType'])
    parameters['conditions']['payment.type'] = query['paymentType'];
  if(query['limit'])
    parameters['limit'] = query['limit'];
  if(query['skip'])
    parameters['skip'] = query['skip'];

  return parameters;
};

ShippingController.prototype.add = function(){
   if(!this.user)
     throw new Error('User is not found');

   if(!this.user.location.prefix)
     throw new Error('Prefix is not found for location ' + location.name);

   var user = this.user;
   var self = this;

   return co(function*(){
       var latestShipping = yield self.model.findOne({}).sort({"number": -1});
       var latestLocationShipping = yield self.model.findOne({"inputLocation": user.location._id}).sort({"number": -1});
       var number = !latestShipping ? 1 : latestShipping.number + 1;
       var spbNumber = !latestLocationShipping ? '1-' + user.location.prefix
                       : (parseInt(latestLocationShipping.spbNumber.split('-')[0]) + 1) + '-' + user.location.prefix;

       var shipping = {
          "number": number,
          "spbNumber": spbNumber,
          "sender": objectId(DEFAULT_CLIENT_ID),
          "destination": objectId(DEFAULT_LOCATION_ID),
          "regions": {
            "source": objectId(DEFAULT_REGION_ID),
            "destination": objectId(DEFAULT_REGION_ID)
          },
          "payment": {
            "type": objectId(DEFAULT_PAYMENT_TYPE_ID),
            "location": objectId(DEFAULT_LOCATION_ID)
          },
          "partner": objectId(DEFAULT_PARTNER_ID),
          "inputLocation": user.location._id,
          "created": {
             "user": user._id,
             "date": new Date()
          },
          "modified": {
             "user": user._id
          }
       };

       return self.save(shipping);
   });
};

ShippingController.prototype.calculateCost = function(shipping, tariff){
   var self = this;
   shipping.cost.total = 0.0;

   _.forEach(shipping.items, function(item){
      var dimensions = {
          length: _.parseInt(item.dimensions.length),
          width: _.parseInt(item.dimensions.width),
          height: _.parseInt(item.dimensions.height),
          weight: _.parseInt(item.dimensions.weight)
       };

       var cost = {
          colli: parseFloat(item.cost.colli),
          additional: parseFloat(item.cost.additional)
       };

       var discount = parseFloat(item.discount);
       var colli = _.parseInt(item.colli.quantity);
       var price = tariff.prices[shipping.tariff];
       var minimum = tariff.minimum;
       var quota = _.parseInt(shipping.sender.quota);
       var colliCost = colli * cost.colli;
       var limit = 0;

       switch(item.itemType.toString()){
          case ITEM_TYPE_WEIGHT:
              limit = dimensions.weight * price;
              item.cost.shipping = limit > minimum ? (price * dimensions.weight) - discount + colliCost + cost.additional
                                                   : minimum - discount + colliCost + cost.additional;
          break;
          case ITEM_TYPE_VOLUME:

          break;
       }

       shipping.cost.total += item.cost.shipping;
   });

   shipping.cost.total += parseFloat(shipping.cost.worker);
   shipping.cost.pph === 0.02 ? shipping.cost.total += (shipping.cost.total * 0.02)
                              : shipping.cost.total /= 0.98;
}

ShippingController.prototype.update = function(data){
   var self = this;

   return co(function* (){
       var tariff = self.tariffController.getTariff(data.sender._id, data.destination._id);

       if(!tariff)
         throw new Error('Tariff is not found for client ' + data.sender.name + 
                         ' and destination ' + data.destination.name);

       var dataModel = new self.model(data);

       self.calculateCost(dataModel);

       dataModel.regions.source = self.user.location.region;
       dataModel.regions.destination = data.destination.region;
       dataModel.modified.user = self.user._id;

       return self.update(dataModel);
   });
}

module.exports = ShippingController;
