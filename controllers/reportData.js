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

   if(query['destination'])
     matches['destination'] = objectId(query['destination']);

   if(query['regionSource'])
     matches['regions.source'] = objectId(query['regionSource']);

   if(query['regionDest'])
     matches['regions.destination'] = objectId(query['regionDest']);

   if(query['trainType'])
     matches['items.recapitulations.trainType'] = objectId(query['trainType']);

   if(query['driver'])
     matches['items.recapitulations.driver'] = objectId(query['driver']);

   if(query['recapDate'])
     matches['items.recapitulations.modified.date'] = new Date(query['recapDate']);

   if(query['vehicleNumber'])
     matches['items.recapitulations.vehicleNumber'] = query['vehicleNumber'];

   if(query['from'] && query['to'])
     matches['date'] = {"$gte" : new Date(query['from']), "$lt": new Date(query['to'])};

   return model.aggregate([
		{$sort : { "_id" : -1} },
		{$match: matches},
      {$unwind: "$items"},
      {$unwind: "$items.recapitulations"},
      {$lookup: {"from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender"}}
   ]).skip(skip).limit(limit).exec();
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

   if(query['regionSource'])
     matches['regions.source'] = objectId(query['regionSource']);

   if(query['deliveryCode'])
     matches['items.deliveries.deliveryCode'] = query['deliveryCode'];

   if(query['vehicleNumber'])
     matches['items.deliveries.vehicleNumber'] = query['vehicleNumber'];

   if(query['driver'])
     matches['items.deliveries.driver'] = objectId(query['driver']);

   if(query['deliveryDate'])
     matches['items.deliveries.modified.date'] = new Date(query['deliveryDate']);

   if(query['from'] && query['to'])
     matches['date'] = {"$gte" : new Date(query['from']), "$lte": new Date(query['to'])};

   return model.aggregate([
		{$sort : { "_id" : -1} },
		{$match: matches},
      {$unwind: "$items"},
      {$unwind: "$items.deliveries"},
      {$lookup: {"from": "clients", "localField": "sender", "foreignField": "_id", "as": "sender"}},
      {$lookup: {"from": "paymentTypes", "localField": "payment.type", "foreignField": "_id", "as": "paymentType"}}
   ]).skip(skip).limit(limit).exec();
};

Controller.prototype.getDeliveriesReport = function(viewModels, user){
   var self = this;

   var result = {
     "title": "LAPORAN PENGANTAR BARANG",
     "template_file": "lapdelivery.xlsx",
     "location": user.location.name,
     "user": user.name,
     "date": new Date(),
     "delivery_driver": null,
     "delivery_car": null,
     "report_data": []
   };

   return co(function* (){
      yield* _co.coEach(viewModels, function*(viewModel){
          var driver = yield driverModel.findOne({_id: objectId(viewModel.items.deliveries.driver)});
          var user = yield userModel.findOne({_id: objectId(viewModel.items.deliveries.created.user)});

          if(driver)
            result.delivery_driver = driver.name;

          result.delivery_car = viewModel.items.deliveries.vehicleNumber;
          result.report_data.push({
              "spb_no": viewModel.spbNumber,
              "sender": viewModel.sender[0].name,
              "receiver": viewModel.receiver.name,
              "receiver_address": viewModel.receiver.address,
              "receiver_contact": viewModel.receiver.contact,
              "content": viewModel.items.content,
              "total_coli": viewModel.items.colli.quantity,
              "coli": viewModel.items.deliveries.quantity,
              "price": viewModel.items.cost.shipping,
              "payment_method": viewModel.paymentType[0].name
          });
      });

      return result;
   });
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

    return model.find(matches).sort({"number": 1}).populate('sender').skip(skip).limit(limit).exec();
};

Controller.prototype.getReturnReport = function(viewModels, user){
    var self = this;
    var result = {
      "title": "LAPORAN RETUR",
      "template_file": "lapretur.xlsx",
      "location": user.location.name,
      "destination": "Surabaya",
      "user": user.name,
      "date": new Date(),
      "report_data": []
    };

    return co(function*(){
        yield* _co.coEach(viewModels, function*(viewModel){

           var deliveries = _.filter(viewModel.items.deliveries, function(delivery){
               return delivery.quantity > 0;
           });

           var drivers = [];
           var vehicleNumbers = [];
           var deliveryDates = [];

           yield* _co.coEach(deliveries, function*(delivery){
                var driver = yield driverModel.findOne({_id: objectId(delivery.driver)});

                if(drive)
                  drivers.push(driver.name);

                vehicleNumbers.push(delivery.vehicleNumber);
                deliveryDates.push(delivery.data);
           });

            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "price": viewModel.cost.total,
                "partner_no": "$32432",
                "limas_color": viewModel.returnInfo.limasColor,
                "relation_color": viewModel.returnInfo.relationColor,
                "delivery_driver": drivers.join(),
                "delivery_car_no": vehicleNumbers.join(),
                "delivery_date": deliveryDates.join(),
                "retur_signature": viewModel.returnInfo.signed ? 'v' : 'x',
                "retur_stamp": viewModel.returnInfo.stamped ? 'v' : 'x',
                "retur_received_by": viewModel.returnInfo.concernedPerson,
                "retur_porter_receipt": viewModel.returnInfo.receipt ? 'v' : 'x'
            });
        });

        return result;
    });
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

    return model.find(matches).sort({"number": 1}).populate('sender').populate('destination').skip(skip).limit(limit).exec();
};

Controller.prototype.getUnconfirmedReport = function(viewModels, user){
    var self = this;
    var result = {
      "title": "LAPORAN SURAT JALAN BELUM KEMBALI",
      "template_file": "lapbelumkembali.xlsx",
      "location": user.location.name,
      "destination": viewModels[0].destination.name,
      "user": user.name,
      "report_data": []
    };

    return co(function*(){
        yield* _co.coEach(viewModels, function*(viewModel){
            result.report_data.push({
                "spb_no": viewModel.spbNumber,
                "sender": viewModel.sender.name,
                "transaction_date": viewModel.date,
                "receiver": viewModel.receiver.name,
                "destination_city": viewModel.destination.name
            });
        });

        return result;
    });
};

Controller.prototype.getPaid = function(query){
    var matches = {"inputLocation": objectId(query['defaultLocation']), "payment.status" : 'Terbayar'};
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;

    if(query['spbNumber'])
      matches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if(query['paymentType'])
      matches['payment.type'] = objectId(query['paymentType']);

    if(query['paymentDate'])
      matches['payment.phases'] = {"$elemMatch": {"date": new Date(query['paymentDate'])}};

    if(query['transferDate'])
      matches['payment.phases'] = {"$elemMatch": {"transferDate": new Date(query['transferDate'])}};

    if(query['from'] && query['to'])
      matches['date'] = {"$gte" : new Date(query['from']), "$lte": new Date(query['to'])};

    return model.find(matches).sort({"number": -1}).populate('sender').populate('payment.type').skip(skip).limit(limit).exec();
};

Controller.prototype.getPaidReport = function(viewModels, user){
  var self = this;
  var lastPaymentDate = _.map(viewModels[0].payment.phases, "date")[0];

  var result = {
    "title": "LAPORAN SURAT JALAN TERBAYAR",
    "template_file": "lapterbayar.xlsx",
    "location": user.location.name,
    "user": user.name,
    "date": lastPaymentDate,
    "report_data": []
  };

  return co(function* (){
     var sumTotalColli = 0;
     var sumTotalWeight = 0;
     var sumPrice = 0;

     yield* _co.coEach(viewModels, function*(viewModel){
         var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
         var contents = _.map(viewModel.items, "content");
         var transactionDates = _.map(viewModel.payment.phases, "transferDate");
         var paymentDates = _.map(viewModel.payment.phases, "date");
         var banks = _.map(viewModel.payment.phases, "bank");

         result.report_data.push({
             "spb_no": viewModel.spbNumber,
             "sender": viewModel.sender.name,
             "receiver": viewModel.receiver.name,
             "content": contents.join(),
             "total_coli": viewModel.colli.quantity,
             "total_weight": totalWeight,
             "price": viewModel.cost.total,
             "transaction_date": viewModel.date,
             "payment_date": paymentDates.join(),
             "bank": banks.join()
         });

         sumTotalColli += viewModel.colli.quantity;
         sumTotalWeight += totalWeight;
         sumPrice += viewModel.cost.total;
     });

     result['sum_total_colli'] = sumTotalColli;
     result['sum_total_weight'] = sumTotalWeight;
     result['sum_price'] = sumPrice;

     return result;
  });
};

Controller.prototype.getUnpaid = function(query){
    var matches = {"inputLocation": objectId(query['defaultLocation']), "payment.status" : {$ne: 'Terbayar'}};
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;

    if(query['spbNumber'])
      matches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if(query['paymentType'])
      matches['payment.type'] = objectId(query['paymentType']);

    if(query['invoice'])
      matches['$or'] = [{"invoice.all": query['invoice']}, {"invoice.client": query['invoice']}, {"invoice.partner": query['invoice']}];

    if(query['from'] && query['to'])
      matches['date'] = {"$gte" : new Date(query['from']), "$lte": new Date(query['to'])};

    return model.find(matches).sort({"number": -1}).populate('sender').populate('payment.type').skip(skip).limit(limit).exec();
};

Controller.prototype.getUnpaidReport = function(viewModels, user){
  var self = this;

  var result = {
    "title": "LAPORAN SURAT JALAN BELUM TERBAYAR",
    "template_file": "lapbelumbayar.xlsx",
    "location": user.location.name,
    "user": user.name,
    "date": new Date(),
    "report_data": []
  };

  return co(function* (){
     var sumTotalColli = 0;
     var sumTotalWeight = 0;
     var sumPrice = 0;

     yield* _co.coEach(viewModels, function*(viewModel){
         var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
         var contents = _.map(viewModel.items, "content");
         var invoices = [viewModel.invoice.all, viewModel.invoice.client, viewModel.invoice.partner];

         result.report_data.push({
             "spb_no": viewModel.spbNumber,
             "sender": viewModel.sender.name,
             "receiver": viewModel.receiver.name,
             "content": contents.join(),
             "total_coli": viewModel.colli.quantity,
             "total_weight": totalWeight,
             "price": viewModel.cost.total,
             "payment_method": viewModel.payment.type.name,
             "invoice_no": invoices.join(),
             "transaction_date": viewModel.date
         });

         sumTotalColli += viewModel.colli.quantity;
         sumTotalWeight += totalWeight;
         sumPrice += viewModel.cost.total;
     });

     result['sum_total_coli'] = sumTotalColli;
     result['sum_total_weight'] = sumTotalWeight;
     result['sum_price'] = sumPrice;

     return result;
  });
};

Controller.prototype.getDeliveryList = function(query){
    var matches = {"inputLocation": objectId(query['defaultLocation'])};
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;

    if(query['spbNumber'])
      matches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if(query['from'] && query['to'])
      matches['date'] = {"$gte" : new Date(query['from']), "$lte": new Date(query['to'])};

    return model.find(matches).sort({"number": -1})
                .populate('sender').populate('destination').populate('regions.destination').populate('payment.type')
                .skip(skip).limit(limit).exec();
};

Controller.prototype.getDeliveryListReport = function(viewModels, user){
  var self = this;

  var result = {
    "title": "LAPORAN DAFTAR KIRIM",
    "template_file": "lapdaftarkirim.xlsx",
    "location": user.location.name,
    "user": user.name,
    "date": new Date(),
    "report_data": []
  };

  return co(function* (){
     var sumTotalColli = 0;
     var sumTotalWeight = 0;
     var sumPrice = 0;

     yield* _co.coEach(viewModels, function*(viewModel){
         var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
         var contents = _.map(viewModel.items, "content");

         result.report_data.push({
             "spb_no": viewModel.spbNumber,
             "sender": viewModel.sender.name,
             "receiver": viewModel.receiver.name,
             "content": contents.join(),
             "total_coli": viewModel.colli.quantity,
             "total_weight": totalWeight,
             "price": viewModel.cost.total,
             "payment_method": viewModel.payment.type.name,
             "destination_region": viewModel.regions.destination.name
         });

         sumTotalColli += viewModel.colli.quantity;
         sumTotalWeight += totalWeight;
         sumPrice += viewModel.cost.total;
     });

     result['sum_total_coli'] = sumTotalColli;
     result['sum_total_weight'] = sumTotalWeight;
     result['sum_price'] = sumPrice;

     return result;
  });
};

Controller.prototype.getCommisions = function(query){
    var matches = {"inputLocation": objectId(query['defaultLocation'])};
    var limit = query['limit'] ? query['limit'] : 10;
    var skip = query['skip'] ? query['skip'] : 0;

    if(query['spbNumber'])
      matches['spbNumber'] = new RegExp(query['spbNumber'], 'i');

    if(query['from'] && query['to'])
      matches['date'] = {"$gte" : new Date(query['from']), "$lte": new Date(query['to'])};

    return model.find(matches).sort({"number": -1}).populate('sender').populate('destination').populate('regions.destination').populate('payment.type')
                .skip(skip).limit(limit).exec();
};

Controller.prototype.getCommisionsReport = function(viewModels, user){
  var self = this;

  var result = {
    "title": "LAPORAN KOMISI",
    "template_file": "lapkomisi.xlsx",
    "location": user.location.name,
    "user": user.name,
    "start_date": new Date(),
    "end_date": new Date(),
    "report_data": []
  };

  return co(function* (){
     var sumTotalColli = 0;
     var sumTotalWeight = 0;
     var sumPrice = 0;

     yield* _co.coEach(viewModels, function*(viewModel){
         var totalWeight = _.sumBy(viewModel.items, 'dimensions.weight');
         var totalAdditionalCost = _.sumBy(viewModel.items, 'cost.additional');
         var contents = _.map(viewModel.items, "content");

         result.report_data.push({
            "transaction_date": viewModel.date,
             "spb_no": viewModel.spbNumber,
             "sender": viewModel.sender.name,
             "receiver": viewModel.receiver.name,
             "content": contents.join(),
             "total_coli": viewModel.colli.quantity,
             "total_weight": totalWeight,
             "price": viewModel.cost.total,
             "bea_tambahan": totalAdditionalCost,
             "bea_kuli": viewModel.cost.worker
         });

         sumTotalColli += viewModel.colli.quantity;
         sumTotalWeight += totalWeight;
         sumPrice += viewModel.cost.total;
     });

     result['sum_total_coli'] = sumTotalColli;
     result['sum_total_weight'] = sumTotalWeight;
     result['sum_price'] = sumPrice;

     return result;
  });
};

Controller.prototype.getInvoiceReport = function(invoice, user){
  var self = this;

    var result = {
      "title": "LAPORAN TAGIHAN",
      "template_file": "laptagihan.xlsx",
      "location": user.location.name,
      "invoice_no": invoice.number,
      "invoice_date": invoice.date,
      "user": user.name,
      "tertagih": invoice.to,
      "tertagih_location": invoice.location,
      "report_data": []
    };

    return co(function*(){
       var sumTotalColli = 0;
       var sumTotalWeight = 0;
       var sumWorkerCost = 0;
       var sumExpeditionCost = 0;
       var sumTotalCost = 0;

       yield* _co.coEach(invoice.shippings, function*(shippingId){
           var shipping = yield model.findOne({_id: objectId(shippingId)}).populate('destination').exec();
           var totalWeight = _.sumBy(shipping.items, 'dimensions.weight');

           result.report_data.push({
              "transaction_date": shipping.date,
              "spb_no": shipping.spbNumber,
              "destination_city": shipping.destination.name,
              "total_coli": shipping.colli.quantity,
              "total_weight": totalWeight,
              "bea_kuli": shipping.cost.worker,
              "partner_fee": shipping.cost.expedition,
              "price": shipping.cost.total
           });

           sumTotalColli += shipping.colli.quantity;
           sumTotalWeight += totalWeight;
           sumWorkerCost += shipping.cost.worker;
           sumExpeditionCost += shipping.cost.expedition;
           sumTotalCost += shipping.cost.total;
       });

       var terbilang = self.getTerbilang(sumTotalCost);
       result['sum_total_coli'] = sumTotalColli;
       result['sum_total_weight'] = sumTotalWeight;
       result['sum_bea_kuli'] = sumWorkerCost;
       result['sum_partner_fee'] = sumExpeditionCost;
       result['sum_price'] = sumTotalCost
       result['terbilang'] = self.getTerbilang(sumTotalCost);
       return result;
    });
};

Controller.prototype.getTerbilang = function(amount){
    amount    = String(amount);
    var numbers   = new Array('0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0');
    var words    = new Array('','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan');
    var level = new Array('','Ribu','Juta','Milyar','Triliun');
    var sentence = '';

    if (amount.length > 15) {
      sentence = "Diluar Batas";
      return sentence;
    }

    for (i = 1; i <= amount.length; i++)
      numbers[i] = amount.substr(-(i),1);

    i = 1;
    j = 0;
    sentence = "";

    while (i <= amount.length) {
      subSentence = "";
      word1 = "";
      word2 = "";
      word3 = "";

      if (numbers[i+2] != "0") {
        if (numbers[i+2] == "1") {
          word1 = "Seratus";
        } else {
          word1 = words[numbers[i+2]] + " Ratus";
        }
      }

      if (numbers[i+1] != "0") {
        if (numbers[i+1] == "1") {
          if (numbers[i] == "0") {
            word2 = "Sepuluh";
          } else if (numbers[i] == "1") {
            word2 = "Sebelas";
          } else {
            word2 = words[numbers[i]] + " Belas";
          }
        } else {
          word2 = words[numbers[i+1]] + " Puluh";
        }
      }

      if (numbers[i] != "0") {
        if (numbers[i+1] != "1") {
          word3 = words[numbers[i]];
        }
      }

      if ((numbers[i] != "0") || (numbers[i+1] != "0") || (numbers[i+2] != "0")) {
        subSentence = word1+" "+word2+" "+word3+" "+level[j]+" ";
      }

      sentence = subSentence + sentence;
      i = i + 3;
      j = j + 1;
    }

    if ((numbers[5] == "0") && (numbers[6] == "0")) {
      sentence = sentence.replace("Satu Ribu","Seribu");
    }

    return sentence + "Rupiah";
};

module.exports = new Controller();
