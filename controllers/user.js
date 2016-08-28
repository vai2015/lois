var mongoose = require('mongoose');
var model = require('../models/user');
var locationModel = require('../models/location');
var roleModel = require('../models/role');
var co = require('co');
var crypto = require('crypto');
var objectId = mongoose.Types.ObjectId;

function Controller(){};

Controller.api = 'user';

Controller.prototype.get = function(id){
   return model.findOne({_id: objectId(id)}, {"hash": 0, "salt": 0}).populate('location').populate('role').exec();
};

Controller.prototype.getParameters = function(query){
  var parameters = {"conditions": {}};

  if(query['name'])
    parameters['conditions']['name'] = new RegExp(query['name'], 'i');

  if(query['location'])
    parameters['conditions']['location'] = objectId(query['location']);

  if(query['role'])
    parameters['conditions']['role'] = objectId(query['role']);

  if(query['limit'])
    parameters['limit'] = query['limit'];

  if(query['skip'] || query['skip'] == 0)
    parameters['skip'] = query['skip'];

   return parameters;
};

Controller.prototype.getAll = function(parameters){
   var find = model.find(parameters.conditions, {"hash": 0, "salt": 0});

   if(parameters['limit'] && (parameters['skip'] || parameters['skip'] == 0))
     find = find.skip(parameters['skip']).limit(parameters['limit']);

   return find.populate('location').populate('role').sort({"name": 1}).exec();
};

Controller.prototype.save = function(data){
  if(data['password']){
     data['salt'] = crypto.randomBytes(16).toString('base64');
     data['hash'] = crypto.createHmac('sha256', data['salt']).update(data['password']).digest('hex');
   }

   var dataModel = new model(data);

   if(!data['_id'])
     return dataModel.save();

   return model.update({_id: objectId(dataModel._id)}, dataModel);
};

Controller.prototype.authenticate = function(userName, password){
   return co(function*(){
      var user = yield model.findOne({"userName": userName}).populate('location').populate('role').exec();

      if(!user)
        throw new Error('User is not found');

      var hash = user.hash;
      var currentHash = crypto.createHmac('sha256', user.salt).update(password).digest('hex');

      if(hash !== currentHash)
        throw new Error('Password is not found');

      return user;
   });
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
