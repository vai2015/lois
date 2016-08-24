var mongoose = require('mongoose');
var co = require('co');
var objectId = mongoose.Types.ObjectId;

function BaseController(model){
    this.model = model;
};

BaseController.prototype.getModel = function(){
   return this.model;
};

BaseController.prototype.get = function(id){
   return this.model.findOne({_id: objectId(id)}).exec();
};

BaseController.prototype.getAll = function(parameters){
   var find = this.model.find(paramters['conditions']);

   if(paramters['limit'] && paramters['skip'])
     find = find.limit(parameters['limit']).skip(parameters['skip']);

   return find.lean().exec();
};

BaseController.prototype.save = function(data){
   var dataModel = new this.model(data);
   return data.save();
};

BaseController.prototype.update = function(data){
   var dataModel = new this.model(data);
   return this.model.update({_id: objectId(dataModel._id)}, dataModel);
};

BaseController.prototype.delete = function(id){
   var self = this;
   return co(function*(){
      var model = yield self.get(id);

      if(!model)
        throw new Error('Data is not found');

      return model.remove({_id: objectId(id)});
   });
}

module.exports = BaseController;
