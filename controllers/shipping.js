var mongoose = require('mongoose');
var model = require('../models/shipping');
var clientModel = require('../models/sender');
var locationModel = require('../models/location');
var paymentTypeModel = require('../models/paymentType');
var partnerModel = require('../models/partner');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

var DEFAULT_LOCATION = "57bedddcc06122040d626411";
var DEFAULT_REGION = "57bedc8254fae0c013130aa9";
var DEFAULT_CLIENT = "57c15819b495e502157d7cea";
var DEFAULT_PAYMENT_TYPE = "57bede7533df7f1c060f8db0";
var DEFAULT_PARTNER = "57c1589eb495e502157d7ceb";
var WEIGHT = "57b31fd9203af5dc2342113c";
var VOLUME = "57b31fd9203af5dc2342113d";
var COLLI = "57bedeaa6a797e9c1d9fdab2";
var MOM = "57bedeaa6a797e9c1d9fdab3";
var JMW = "57bedeaa6a797e9c1d9fdab5";
var SMW = "57bedeaa6a797e9c1d9fdab6";
var CW = "57bedeaa6a797e9c1d9fdab7";

function Controller(){
  this.tariffController = require('../controllers/tariffController');
  this.locationController = require('../controllers/locationController');
};

Controller.prototype.get = function(){
  return model.findOne({_id: objectId(id)}).populate('sender').populate('destination').populate('payment.type')
              .populate('payment.location').populate('partner').lean().exec();
};

Controller.prototype.getParameters = function(query){
  var parameters = {"conditions": {}};

  if(query['name'])
     parameters['conditions']['spbNumber'] = new RegExp(query['spbNumber'], 'i');

  if(query['receiver'])
    parameters['conditions']['receiver.name'] = new RegExp(query['receiver'], 'i');

  if(query['paymentStatus'])
    parameters['conditions']['payment.status'] = new RegExp(query['paymentStatus'], 'i');

  if(query['destination'])
    parameters['conditions']['destination'] = objectId(query['destination']);

  if(query['sender'])
    parameters['conditions']['sender'] = objectId(query['sender']);

  if(query['paymentType'])
    parameters['conditions']['payment.type'] = objectId(query['paymentType']);

  if(query['partner'])
    parameters['conditions']['partner'] = objectId(query['partner']);

  if(query['from'] && query['to']){
     var fromShipping = new Date(query['fromShipping']);
     var toShipping = new Date(query['toShipping']);
     parameters['conditions']['date'] = {"$gte" : fromShipping, "$lt": toShipping};
  }

  if(query['limit'])
     parameters['limit'] = query['limit'];

  if(query['skip'] || query['skip'] == 0)
     parameters['skip'] = query['skip'];

  parameters['populations'] = ['sender', 'destination', 'paymentType', 'partner'];

  return parameters;
};

Controller.prototype.getAll = function(parameters){
  var find = model.find(parameters.conditions);

  if(parameters['limit'] && (parameters['skip'] || parameters['skip'] == 0))
    find = find.skip(parameters['skip']).limit(parameters['limit']);

  if(parameters['populations'])
    find = find.populate(parameters['populations'].join());

  return find.sort({"number": -1}).lean().exec();
};

Controller.prototype.add = function(userId, locationId){
   var self = this;

   return co(function*(){
      var lastShipping = yield model.findOne({}).sort({"number": -1});
      var lastLocShipping = yield model.findOne({"inputLocation": objectId(locationId)}).sort({"number": -1});
      var location = yield self.locationController.get(locationId);

      if(!location)
        throw new Error('Location is not found');

      if(!location.prefix)
        throw new Error('Prefix is not found for location ' + location.name);

      var number = !lastShipping ? 1 : lastShipping.number + 1;

      var spbNumber = !lastLocShipping ? '1-' + location.prefix
                      : (parseInt(lastLocShipping.spbNumber.split('-')[0]) + 1) + '-' + location.prefix;

      var shipping = {
         "number": number,
         "spbNumber": spbNumber,
         "sender": DEFAULT_CLIENT,
         "destination": DEFAULT_LOCATION,
         "regions": {
           "source": DEFAULT_REGION,
           "destination": DEFAULT_REGION
         },
         "payment": {
            "type": DEFAULT_PAYMENT_TYPE,
            "location": DEFAULT_LOCATION
         },
         "partner": DEFAULT_PARTNER,
         "inputLocation": location._id,
         "created": {
           "user": userId,
           "date": new Date()
         },
         "modified": {"user": userId }
      };

      return self.save(shipping);
   });
};

Controller.prototype.calculateCost = function(shipping, tariff){
   var self = this;
   var price = tariff.prices[shipping.tariff];
   var minimum = tariff.minimum;
   var quota = _.parseInt(shipping.sender.quota);

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

       var colli = _.parseInt(item.colli.quantity);
       var colliCost = colli * cost.colli;
       var discount = parseFloat(item.discount);
       var limit = 0;

       switch(item.itemType.id.toString()){
          case WEIGHT:
            limit = dimensions.weight * price;
            item.cost.shipping = limit > minimum ? (price * dimensions.weight) - discount + colliCost + cost.additional :
                                                   minimum - discount + colliCost + cost.additional;
          break;
          case VOLUME:
            limit = dimensions.length * dimensions.width * (dimensions.height / 4000) * price * colli;
            item.cost.shipping = limit > minimum ? limit - discount + cost.additional : minimum - discount + colliCost + cost.additional;
          break;
          case COLLI:
             item.cost.shipping = colliCost + cost.additional - discount;
          break;
          case MOM:
             item.cost.shipping = (colli - 1) * colliCost + cost.additional - discount + minimum;
          break;
          case JMW:
             limit = (dimensions.weight * price) + cost.additional;
             item.cost.shipping = limit > minimum ? (price * dimensions.weight) - discount + colliCost + cost.additional :
                                                    minimum - discount + colliCost + cost.additional;
          break;
          case SMW:
             item.cost.shipping = dimensions.weight > quota ? minimum + ((dimensions.weight - quota) * price) - discount + cost.additional :
                                                              minimum - discount + colliCost + cost.additional;
          break;
          case CW:
             item.cost.shipping = dimensions.weight > quota ? minimum + ((dimensions.weight - quota) * price) - (colli - 1)
                                                              * colliCost - discount + cost.additional : 0;
          break;
       }

       shipping.cost.total += item.cost.shipping;
   });

   shipping.cost.total += shipping.cost.worker;

   shipping.cost.pph === 0.02 ? shipping.cost.total += (shipping.cost.total * 0.02)
                              : shipping.cost.total /= 0.98;
};

Controller.prototype.save = function(data){
   var self = this;

   data.regions.destination = data.destination.region._id;

   return co(function*(){
      var source = yield self.locationController.get(data.sender.location._id);

      if(!source)
        throw new Error('Client location is not found');

      var tariff = yield self.tariffController.getTariff(data.sender._id, data.destination._id);

      if(!tariff)
        throw new Error('Tariff is not found for client ' + data.sender.name + ' and location ' + data.destination.name);

      data.regions.source = source.region._id;
      self.calculateCost(data, tariff);

      var dataModel = new model(data);
      return model.update({_id: objectId(dataModel._id)}, dataModel);
   });
};

module.exports = new Controller();
