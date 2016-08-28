var mongoose = require('mongoose');
var model = require('../models/shipping');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller(){};

Controller.prototype.getRecapitulations = function(query){
   var matches = {"items.recapitulations.quantity" : {"$gt": 0}};
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

module.exports = new Controller();
