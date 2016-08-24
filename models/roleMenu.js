var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
   id: {type: Number, default: null},
   name: {type: String, required: true},
   state: {type: String, required: true},
   icon: {type: String, required: true},
   position: {type: Number, default: 0},
   roles: [{type: refId, ref: 'Role'}]
}, {versionKey: false, collection: 'roleMenus'});

module.exports = mongoose.model('RoleMenu', model);
