var mongoose = require('mongoose');
var model = require('../models/client');
var locationModel = require('../models/location');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller(){}

Controller.api = 'client';

Controller.prototype.get = function(id){
   return model.findOne({_id: objectId(id)}).populate('location').exec();
};

Controller.prototype.getParameters = function(query){
  var parameters = {"conditions": {}};

  if(query['name'])
     parameters['conditions']['name'] = new RegExp(query['name'], 'i');

  if(query['location'])
    parameters['conditions']['location'] = objectId(query['location']);

  if(query['limit'])
     parameters['limit'] = query['limit'];

  if(query['skip'] || query['skip'] == 0)
     parameters['skip'] = query['skip'];

   parameters['populations'] = ['location'];

   return parameters;
};

Controller.prototype.getAll = function(parameters){
   var find = model.find(parameters.conditions);

   if(parameters['limit'] && (parameters['skip'] || parameters['skip'] == 0))
     find = find.skip(parameters['skip']).limit(parameters['limit']);

   if(parameters['populations'])
     find = find.populate(parameters['populations'].join());

   return find.sort({"name": 1}).exec();
};

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
