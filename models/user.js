var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
   number: {type: Number, default: null},
   name: {type: String, required: true},
   userName: {type: String, required: true},
   hash: {type: String, required: true},
   salt: {type: String, required: true},
   location: {type: refId, ref: 'Location'},
   role: {type: refId, ref: 'Role'}
}, {versionKey: false, collection: 'users'});

module.exports = mongoose.model('User', model);
