var mongoose = require('mongoose');
var model = require('../models/shipping');
var clientModel = require('../models/client');
var locationModel = require('../models/location');
var paymentTypeModel = require('../models/paymentType');
var partnerModel = require('../models/partner');
var itemTypeModel = require('../models/itemType');
var auditModel = require('../models/audit');
var co = require('co');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

var DEFAULT_LOCATION = "57c45ac08e8ddc7019605687";
var DEFAULT_REGION = "57c459f9d1bb7304270c4552";
var DEFAULT_CLIENT = "57c45d368e4f6580202789e1";
var DEFAULT_PAYMENT_TYPE = "57c46a82398059b414b37864";
var DEFAULT_PARTNER = "57c46a80398059b414b37854";
var WEIGHT = "57c46a80398059b414b37850";
var VOLUME = "57c46a81398059b414b37857";
var COLLI = "57c46a82398059b414b37868";
var MOM = "57c46a82398059b414b3786b";
var JMW = "57c46a82398059b414b37870";
var SMW = "57c46a82398059b414b37872";
var CW = "57c46a82398059b414b37874";

function Controller(){
  this.tariffController = require('../controllers/tariff');
  this.locationController = require('../controllers/location');
  this.clientController = require('../controllers/client');
};

Controller.prototype.get = function(id){
  return model.findOne({_id: objectId(id)}).populate('sender').populate('destination').populate('payment.type')
              .populate('payment.location').populate('partner').lean().exec();
};

Controller.prototype.getBySpbNumber = function(spbNumber){
  return model.findOne({spbNumber: spbNumber}).populate('sender').populate('destination').populate('payment.type')
              .populate('payment.location').populate('partner').lean().exec();
};

Controller.prototype.getParameters = function(query){
  var parameters = {"conditions": {"inputLocation" : query['location']}};

  parameters['limit'] = query['limit'] ? query['limit'] : 10;
  parameters['skip'] = query['skip'] ? query['skip'] : 0;

  if(query['spbNumber'])
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
     var fromShipping = new Date(query['from']);
     var toShipping = new Date(query['to']);

     if(query['from'] === query['to'])
       parameters['conditions']['date'] = fromShipping;
     else
       parameters['conditions']['date'] = {"$gte" : fromShipping, "$lte": toShipping};
  }

  return parameters;
};

Controller.prototype.getAll = function(parameters){
  var find = model.find(parameters.conditions);

  if(parameters['limit'] && (parameters['skip'] || parameters['skip'] == 0))
    find = find.skip(parameters['skip']).limit(parameters['limit']);

  return find.sort({"number": -1}).populate('sender')
                                  .populate('destination')
                                  .populate('payment.type')
                                  .populate('items.itemType')
                                  .populate('items.packingType')
                                  .lean()
                                  .exec();
};

Controller.prototype.add = function(user){
   var self = this;

   if(!user.location)
     throw new Error('Location is not found');

   if(!user.location.prefix)
     throw new Error('Prefix is not found for location ' + user.location.name);

   var location = user.location;

   return co(function*(){
      var lastShipping = yield model.findOne({}).sort({"number": -1});
      var lastLocShipping = yield model.findOne({"inputLocation": objectId(location._id)}).sort({"number": -1});

      var number = !lastShipping ? 1 : lastShipping.number + 1;

      var spbNumber = !lastLocShipping ? '1-' + location.prefix
                      : (parseInt(lastLocShipping.spbNumber.split('-')[0]) + 1) + '-' + location.prefix;

      var shipping = {
         "number": number,
         "spbNumber": spbNumber,
         "sender": DEFAULT_CLIENT,
         "destination": DEFAULT_LOCATION,
         "regions": {"source": DEFAULT_REGION, "destination": DEFAULT_REGION},
         "payment": {"type": DEFAULT_PAYMENT_TYPE, "location": DEFAULT_LOCATION},
         "partner": DEFAULT_PARTNER,
         "inputLocation": user.location._id,
         "created": {"user": user._id, "date": new Date()},
         "modified": {"user": user._id}
      };
      return new model(shipping).save();
   });
};

Controller.prototype.calculateCost = function(shipping, tariff, user, audit){
   var self = this;
   var price = 0;
   var minimum = 0;
   var quota = shipping.sender.quota;

   if(tariff){
      price = tariff.prices[shipping.tariff];
      minimum = tariff.minimum;
   }

   shipping.colli.quantity = 0;
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
         additional: parseFloat(item.cost.additional),
         discount: parseFloat(item.cost.discount)
       };

       var colli = _.parseInt(item.colli.quantity);
       var colliCost = colli * cost.colli;
       var limit = 0;
       var itemType = item.itemType._id ? item.itemType._id : item.itemType;

       switch(itemType.toString()){
          case WEIGHT:
            limit = dimensions.weight * price;
            item.cost.shipping = limit > minimum ? (price * dimensions.weight) - cost.discount + colliCost + cost.additional :
                                                   minimum - cost.discount + colliCost + cost.additional;
          break;
          case VOLUME:
            limit = dimensions.length * dimensions.width * (dimensions.height / 4000) * price * colli;
            item.cost.shipping = limit > minimum ? limit - cost.discount + cost.additional : minimum - cost.discount + colliCost + cost.additional;
          break;
          case COLLI:
             item.cost.shipping = colliCost + cost.additional - cost.discount;
          break;
          case MOM:
             item.cost.shipping = (colli - 1) * colliCost + cost.additional - cost.discount + minimum;
          break;
          case JMW:
             limit = (dimensions.weight * price) + cost.additional;
             item.cost.shipping = limit > minimum ? (price * dimensions.weight) - cost.discount + colliCost + cost.additional :
                                                    minimum - cost.discount + colliCost + cost.additional;
          break;
          case SMW:
             item.cost.shipping = dimensions.weight > quota ? minimum + ((dimensions.weight - quota) * price) - cost.discount + cost.additional :
                                                              minimum - cost.discount + colliCost + cost.additional;
          break;
          case CW:
             item.cost.shipping = dimensions.weight > quota ? minimum + ((dimensions.weight - quota) * price) - (colli - 1)
                                                              * colliCost - cost.discount + cost.additional : 0;
          break;
       }

       if(item.status == 'Belum Terekap')
         item.colli.available = item.colli.quantity;

       shipping.colli.quantity += colli;
       shipping.cost.total += item.cost.shipping;
   });

   shipping.cost.total += shipping.cost.worker;

   if(shipping.cost.pph === 0.02)
     shipping.cost.total += (shipping.cost.total * 0.02);

   else if(shipping.cost.pph === 0.98)
     shipping.cost.total /= 0.98;
};

Controller.prototype.save = function(data, user){
   var self = this;

   return co(function*(){
      var sender = yield self.clientController.get(data.sender._id ? data.sender._id : data.sender);
      var source = yield self.locationController.get(sender.location ? sender.location._id : null);
      var destination = yield self.locationController.get(data.destination._id ? data.destination._id : data.destination);

      var tariff = yield self.tariffController.getTariff(sender._id, destination._id);

      self.calculateCost(data, tariff, user, true);

      data.regions.source = source == null ? data.regions.source : source.region._id;
      data.regions.destination = destination.region._id ? destination.region._id : data.regions.destination;

      var dataModel = new model(data);
      return model.update({_id: objectId(dataModel._id)}, dataModel);
   });
};

Controller.prototype.audit = function(shippingId, item, user){
   var auditData = new auditModel();
   var itemType = item.itemType._id ? item.itemType._id : item.itemType;

   return co(function*(){
      var prevShipping = yield model.findOne({"_id": shippingId});
      var curItemType = yield itemTypeModel.findOne({"_id": objectId(itemType)});

      if(!prevShipping)
        return null;

      var itemNotes = [];

      var prevItem = _.find(prevShipping.items, function(prevItem){
          return prevItem._id.toString() === item._id.toString();
      });

      if(prevItem.dimensions.length !== item.dimensions.length)
        itemNotes.push('Perubahan dimensi panjang dari ' + prevItem.dimensions.length + ' ke ' + item.dimensions.length);

      if(prevItem.dimensions.width !== item.dimensions.width)
        itemNotes.push('Perubahan dimensi lebar dari ' + prevItem.dimensions.width + ' ke ' + item.dimensions.width);

      if(prevItem.dimensions.height !== item.dimensions.height)
        itemNotes.push('Perubahan dimensi tinggi dari ' + prevItem.dimensions.height + ' ke ' + item.dimensions.height);

      if(prevItem.dimensions.weight !== item.dimensions.weight)
        itemNotes.push('Perubahan dimensi berat dari ' + prevItem.dimensions.weight + ' ke ' + item.dimensions.weight);

      if(prevItem.colli.quantity !== item.colli.quantity)
        itemNotes.push('Perubahan coli dari ' + prevItem.colli.quantity + ' ke ' + item.colli.quantity);

      if(prevItem.cost.additional !== item.cost.additional)
        itemNotes.push('Perubahan biaya tambahan dari ' + prevItem.cost.additional + ' ke ' + item.cost.additional);

      if(prevItem.cost.discount !== item.cost.discount)
        itemNotes.push('Perubahan diskon dari ' + prevItem.cost.discount + ' ke ' + item.cost.discount);

      if(prevItem.itemType.toString() !== item.itemType._id.toString())
        itemNotes.push('Perubahan jenis barang ke ' + curItemType.name);


      if(itemNotes.length > 0) {
          auditData.notes = itemNotes.join();
          auditData.type = 'price';
          auditData.date = new Date();
          auditData.data = item;
          auditData.user = user._id
          console.log(auditData);
          return yield auditData.save();
      }

      return null;
   });
}

module.exports = new Controller();
