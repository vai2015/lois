var mongoose = require('mongoose');
var model = require('../models/shipping');
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var objectId = mongoose.Types.ObjectId;

function Controller(){}

Controller.prototype.getParameters = function(query){
   var parameters = {"conditions": {"inputLocation": objectId(query['defaultLocation']), "sender": {"$ne": objectId("57c15819b495e502157d7cea")}}};
   parameters['limit'] = query['limit'] ? query['limit'] : 10;
   parameters['skip'] = query['skip'] ? query['skip'] : 0;

   if(query['spbNumber'])
     parameters['conditions']['spbNumber'] = new RegExp(query['spbNumber'], 'i');

   if(query['receiver'])
     parameters['conditions']['receiver.name'] = new RegExp(query['receiver'], 'i');

   if(query['from'] && query['to']){
      var fromShipping = new Date(query['from']);
      var toShipping = new Date(query['to']);
      parameters['conditions']['date'] = {"$gte" : fromShipping, "$lte": toShipping};
   }

   return parameters;
};

Controller.prototype.getAll = function(parameters){
  var find = model.find(parameters.conditions);

  if(parameters['limit'] && (parameters['skip'] || parameters['skip'] == 0))
    find = find.skip(parameters['skip']).limit(parameters['limit']);

  return find.sort({"number": -1}).populate('sender').populate('destination').populate('payment.type')
                                  .populate('items.itemType').populate('items.packingType').lean().exec();
};

Controller.prototype.getDataReport = function(shipping){
    var result = {
      "title": "SURAT JALAN",
    	"template_file": "suratjalan.xlsx",
    	"sender": shipping.sender.name,
    	"transaction_driver": shipping.driver,
    	"destination_city": shipping.destination.name,
    	"receiver": shipping.receiver.name,
    	"receiver_phone": shipping.receiver.contact,
    	"contents":[],
    	"sum_total_coli": shipping.colli.quantity,
    	"sum_total_weight": null,
    	"bea_tambahan": null,
    	"sum_price": shipping.cost.total,
    	"payment_method": shipping.payment.type.name,
    	"spb_no": shipping.spbNumber,
    	"po_no": shipping.notes.po,
    	"transaction_date": shipping.date
    };

    result['contents'] = [];
    var totalWeight = 0;
    var additional = 0;

    _.forEach(shipping.items, function(item){
        result['contents'].push({
          "content": item.content,
          "packing": item.packingType.name,
          "volume": item.dimensions.length + "x" + item.dimensions.width + "x" + item.dimensions.height
        });

        totalWeight += item.dimensions.weight;
        additional += item.cost.additional;
    });

    result['sum_total_weight'] = totalWeight;
    result['bea_tambahan'] = additional;

    return result;
};

module.exports = new Controller();
