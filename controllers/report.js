var mongoose = require('mongoose');
var model = require('../models/shipping');
var driverModel = require('../models/driver');
var paymentTypeModel = require('../models/paymentType');
var userModel = require('../models/user');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
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

Controller.prototype.getRecapitulationsReport = function(viewModels, user){
    var self = this;
    var result = {
     "title": "LAPORAN REKAP",
     "template_file": "laprekap.xlsx",
     "location": user.location.name,
     "date": new Date(),
     "recap_driver": null,
     "recap_car": null,
     "report_data": []
    };

    return co(function* (){
      var totalColliQuantity = 0;
      var totalRecappedColli = 0;
      var totalWeight = 0;
      var totalPrice = 0;

      yield* _co.coEach(viewModels, function*(viewModel){
         var driver = yield driverModel.findOne({_id: objectId(viewModel.items.recapitulations.driver)});
         var user = yield userModel.findOne({_id: objectId(viewModel.items.recapitulations.created.user)});
         var paymentType = yield paymentTypeModel.findOne({_id: objectId(viewModel.payment.type)});

         if(driver)
            result.recap_driver = driver.name;

         result.recap_car = viewModel.items.recapitulations.vehicleNumber;

         result.report_data.push({
           "spb_no": viewModel.spbNumber,
           "sender": viewModel.sender[0].name,
           "receiver": viewModel.receiver.name,
           "content": viewModel.items.content,
           "total_coli": viewModel.items.recapitulations.quantity,
           "coli": viewModel.items.colli.quantity,
           "weight": viewModel.items.dimensions.weight,
           "price": viewModel.items.cost.shipping,
           "payment_method": paymentType.name,
           "recap_limas_color": viewModel.items.recapitulations.limasColor,
           "recap_relation_color": viewModel.items.recapitulations.relationColor
         });

          totalColliQuantity += _.parseInt(viewModel.items.colli.quantity);
          totalRecappedColli += _.parseInt(viewModel.items.recapitulations.quantity);
          totalWeight += parseFloat(viewModel.items.dimensions.weight);
          totalPrice += parseFloat(viewModel.items.cost.shipping);
      });

        result['sum_total_colli'] = totalColliQuantity;
        result['sum_colli'] = totalRecappedColli;
        result['sum_weight'] = totalWeight;
        result['sum_price'] = totalPrice;
        return result;
    });
}

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

Controller.prototype.getUnconfirmed = function(query){
    var matches = {"inputLocation": objectId(query['defaultLocation']), "returned" : true, "confirmed": false};
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
