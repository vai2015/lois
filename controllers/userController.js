var mongoose = require('mongoose');
var util = require('util');
var model = require('../models/user');
var crypto = require('crypto');
var co = require('co');
var BaseController = require('./baseController');
var RoleMenuController = require('../controllers/roleMenuController');
var RoleReportController = require('../controllers/roleReportController');
var objectId = mongoose.Types.ObjectId;

function UserController(){
   UserController.super_.call(this, model);
   this.roleMenuController = new RoleMenuController();
   this.roleReportController = new RoleReportController();
};

util.inherits(UserController, BaseController);

UserController.api = 'user';

UserController.prototype.authenticate = function(userName, password){
   var self = this;

   return co(function*(){
      var user = yield self.getModel().findOne({userName: userName}).populate('location').exec();

      if(!user)
        throw new Error('User is not found');

      var userHash = user.hash;
      var hash = crypto.createHmac('sha256', user.salt).update(password).digest('hex');

      if(userHash !== hash)
        throw new Error('Password is not found');

      return user;
   });
};

UserController.prototype.setParameters = function(query){
    var parameters = {"conditions": {}};

    if(query['name'])
       parameters['conditions']['name'] = new RegExp(query['name'], 'i');

    if(query['location'])
       parameters['conditions']['location'] = query['location'];

    if(query['role'])
       parameters['conditions']['role'] = query['role'];

    if(query['limit'])
       parameters['limit'] = query['limit'];

    if(query['skip'])
       parameters['skip'] = query['skip'];

    return parameters;
};

UserController.prototype.getMenus = function(roleId){
   var parameters = this.roleMenuController.getParameters({"roles": roleId});
   return this.roleMenuController.getAll(parameters);
};

UserController.prototype.getReports = function(roleId){
   var parameters = this.roleReportController.getParameters({"roles": roleId});
   return this.roleReportController.getAll(parameters);
}

module.exports = UserController;
