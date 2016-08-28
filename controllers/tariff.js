var mongoose = require('mongoose');
var model = require('../models/tariff');
var locationModel = require('../models/location');
var clientModel = require('../models/client');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller(){}

Controller.api = 'tariff';

Controller.prototype.get = function(id){
   return model.findOne({_id: objectId(id)}).populate('client').populate('destination').exec();
};

Controller.prototype.getParameters = function(query){
  var parameters = {"conditions": {}};

  if(query['name'])
     parameters['conditions']['name'] = new RegExp(query['name'], 'i');

  if(query['client'])
    parameters['conditions']['client'] = objectId(query['client']);

  if(query['destination'])
    parameters['conditions']['destination'] = objectId(query['destination']);

  if(query['limit'])
     parameters['limit'] = query['limit'];

  if(query['skip'] || query['skip'] == 0)
     parameters['skip'] = query['skip'];

   return parameters;
};

Controller.prototype.getAll = function(parameters){
   var find = model.find(parameters.conditions);

   if(parameters['limit'] && (parameters['skip'] || parameters['skip'] == 0))
     find = find.skip(parameters['skip']).limit(parameters['limit']);

   return find.populate('client').populate('destination').sort({"client._id": 1}).exec();
};

Controller.prototype.getTariff = function(clientId, destinationId){
   return model.findOne({client: objectId(clientId), destination: objectId(destinationId)}).exec();
}

Controller.prototype.save = function(data){
   var dataModel = new model(data);

   if(!data['_id'])
     return dataModel.save();

   return model.update({_id: objectId(dataModel._id)}, dataModel);
};

Controller.prototype.delete = function(id){
   var self = this;
   return co(function*(){
      var model = yield self.get(id);

      if(!model)
        throw new Error('Data is not found');

      return model.remove({_id: objectId(id)});
   });
};

module.exports = new Controller();
