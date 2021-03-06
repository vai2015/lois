var mongoose = require('mongoose');
var model = require('../models/roleReport');
var roleModel = require('../models/role');
var reportModel = require('../models/report');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function Controller(){}

Controller.api = 'roleReport';

Controller.prototype.get = function(id){
   return model.findOne({_id: objectId(id)}).populate('report').populate('role').exec();
};

Controller.prototype.getParameters = function(query){
  var parameters = {"conditions": {}};

  if(query['report'])
     parameters['conditions']['report'] = objectId(query['report']);

  if(query['role'])
    parameters['conditions']['role'] = objectId(query['role']);

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

   return find.populate('report').populate('role').sort({"name": 1}).exec();
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
