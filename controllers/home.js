var mongoose = require('mongoose');
var model = require('../models/shipping');
var co = require('co');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

function Controller(){

};

Controller.prototype.getOverall = function(query, user){
   var match = {"inputLocation": objectId(user.location._id)};

   if(query['date'])
     match['date'] = new Date(query['date']);

   return model.aggregate([
       {"$match": match},
       {"$unwind": "$items"},
       {
         "$group": {
           "_id": "_id",
           "colli": {"$sum": "$items.colli.quantity"},
           "weight": {"$sum": "$items.dimensions.weight"},
           "price": {"$sum": "$cost.total"},
           "shippings": {"$sum": 1}
         }
       }
   ]).exec();
};

Controller.prototype.getDestinations = function(query, user){
   var limit = query['limit'] ? _.parseInt(query['limit']) : 10;
   var skip = query['skip'] ? _.parseInt(query['skip']) : 0;
   var match = {"inputLocation": objectId(user.location._id)};

   if(query['date'])
     match['date'] = new Date(query['date']);

   return model.aggregate([
       {"$match": match},
       {"$unwind": "$items"},
       {
         "$group": {
           "_id": "$destination",
           "colli": {"$sum": "$items.colli.quantity"},
           "weight": {"$sum": "$items.dimensions.weight"},
           "price": {"$sum": "$cost.total"},
           "shippings": {"$sum": 1}
         }
       },
       {"$lookup": {"from": "locations", "localField": "_id", "foreignField": "_id", "as": "category"}},
       {"$sort": {"category.name": 1}},
       {"$skip": skip},
       {"$limit": limit}
   ]).exec();
}

Controller.prototype.getSenders = function(query, user){
   var limit = query['limit'] ? _.parseInt(query['limit']) : 10;
   var skip = query['skip'] ? _.parseInt(query['skip']) : 0;
   var match = {"inputLocation": objectId(user.location._id)};

   if(query['date'])
     match['date'] = new Date(query['date']);

   return model.aggregate([
       {"$match": match},
       {"$unwind": "$items"},
       {
         "$group": {
           "_id": "$sender",
           "colli": {"$sum": "$items.colli.quantity"},
           "weight": {"$sum": "$items.dimensions.weight"},
           "price": {"$sum": "$cost.total"},
           "shippings": {"$sum": 1}
         }
       },
       {"$lookup": {"from": "clients", "localField": "_id", "foreignField": "_id", "as": "category"}},
       {"$sort": {"category.name": 1}},
       {"$skip": skip},
       {"$limit": limit}
   ]).exec();
}

Controller.prototype.getPaymentTypes = function(query, user){
   var limit = query['limit'] ? _.parseInt(query['limit']) : 10;
   var skip = query['skip'] ? _.parseInt(query['skip']) : 0;
   var match = {"inputLocation": objectId(user.location._id)};

   if(query['date'])
     match['date'] = new Date(query['date']);

   return model.aggregate([
       {"$match": match},
       {"$unwind": "$items"},
       {
         "$group": {
           "_id": "$payment.type",
           "colli": {"$sum": "$items.colli.quantity"},
           "weight": {"$sum": "$items.dimensions.weight"},
           "price": {"$sum": "$cost.total"},
           "shippings": {"$sum": 1}
         }
       },
       {"$lookup": {"from": "paymentTypes", "localField": "_id", "foreignField": "_id", "as": "category"}},
       {"$sort": {"category.name": 1}},
       {"$skip": skip},
       {"$limit": limit}
   ]).exec();
}

Controller.prototype.getPaymentStatuses = function(query, user){
   var limit = query['limit'] ? _.parseInt(query['limit']) : 10;
   var skip = query['skip'] ? _.parseInt(query['skip']) : 0;
   var match = {"inputLocation": objectId(user.location._id)};

   if(query['date'])
     match['date'] = new Date(query['date']);

   return model.aggregate([
       {"$match": match},
       {"$unwind": "$items"},
       {
         "$group": {
           "_id": "$payment.status",
           "colli": {"$sum": "$items.colli.quantity"},
           "weight": {"$sum": "$items.dimensions.weight"},
           "price": {"$sum": "$cost.total"},
           "shippings": {"$sum": 1}
         }
       },
       {"$sort": {"payment.status": 1}},
       {"$skip": skip},
       {"$limit": limit}
   ]).exec();
}

Controller.prototype.getRegions = function(query, user){
   var limit = query['limit'] ? _.parseInt(query['limit']) : 10;
   var skip = query['skip'] ? _.parseInt(query['skip']) : 0;
   var match = {"inputLocation": objectId(user.location._id)};

   if(query['date'])
     match['date'] = new Date(query['date']);

   return model.aggregate([
       {"$match": match},
       {"$unwind": "$items"},
       {
         "$group": {
           "_id": "$regions.destination",
           "colli": {"$sum": "$items.colli.quantity"},
           "weight": {"$sum": "$items.dimensions.weight"},
           "price": {"$sum": "$cost.total"},
           "shippings": {"$sum": 1}
         }
       },
       {"$lookup": {"from": "regions", "localField": "_id", "foreignField": "_id", "as": "category"}},
       {"$sort": {"category.name": 1}},
       {"$skip": skip},
       {"$limit": limit}
   ]).exec();
}

module.exports = new Controller();
