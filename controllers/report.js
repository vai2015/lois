var mongoose = require('mongoose');
var model = require('../models/shipping');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller(){};

Controller.prototype.getRecapitulations = function(query){
   var matches = {"inputLocation": objectId(query['defaultLocation']), "items.recapitulations.quantity" : {"$gt": 0}};
   var limit = query['limit'] ? query['limit'] : 10;
   var skip = query['skip'] ? query['skip'] : 0;

   if(query['spbNumber'])
     matches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

   if(query['recapDate'])
     matches['items.recapitulations'] = {"$elemMatch": {"date": new Date(query['recapDate'])}};

   if(query['vehicleNumber'])
     matches['items.recapitulations'] = {"$elemMatch": {"vehicleNumber": query['vehicleNumber']}};

   if(query['from'] && query['to'])
     matches['date'] = {"$gte" : new Date(query['from']), "$lt": new Date(query['to'])};

   return model.aggregate([
      {$unwind: "$items"},
      {$unwind: "$items.recapitulations"},
      {$match: matches},
      {$lookup: {"from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender"}}
   ]).sort({"number": -1}).skip(skip).limit(limit).exec();
};

Controller.prototype.getDeliveries = function(query){
   var matches = {"regions.destination": objectId(query['defaultRegion']), "items.deliveries.quantity" : {"$gt": 0}};
   var limit = query['limit'] ? query['limit'] : 10;
   var skip = query['skip'] ? query['skip'] : 0;

   if(query['spbNumber'])
     matches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

   if(query['destination'])
     matches['destination'] = objectId(query['destination']);

   if(query['driver'])
     matches['items.deliveries'] = {"$elemMatch": {"driver": objectId(query['driver'])}};

   if(query['from'] && query['to'])
     matches['date'] = {"$gte" : new Date(query['from']), "$lte": new Date(query['to'])};

   return model.aggregate([
      {$unwind: "$items"},
      {$unwind: "$items.deliveries"},
      {$match: matches},
      {$lookup: {"from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender"}},
      {$lookup: {"from": "paymentTypes", "localField": "payment.type", "foreignField": "_id", "as": "paymentType"}}
   ]).sort({"number": -1}).skip(skip).limit(limit).exec();
};

Controller.prototype.getReturn = function(query){
    var matches = {"regions.destination": objectId(query['defaultRegion']), "returned" : true};
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;

    if(query['spbNumber'])
      matches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if(query['paymentType'])
      matches['payment.type'] = objectId(query['paymentType']);

    if(query['date'])
      matches['returnInfo.date'] = new Date(query['date']);

    if(query['from'] && query['to'])
      matches['date'] = {"$gte" : new Date(query['from']), "$lte": new Date(query['to'])};

    return model.find(matches).populate('sender').skip(skip).limit(limit).exec();
};

module.exports = new Controller();
