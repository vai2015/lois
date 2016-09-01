var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
  shipping: {type: refId, ref: 'Shipping'},
  date: {type: Date, default: null},
  filePath: {type: String, default: null},
  stamped: {type: Boolean, default: false},
  signed: {type: Boolean, default: false},
  receipt: {type: Boolean, default: false},
  accepted: {type: Boolean, default: false},
  limasColor: {type: String, default: null},
  relationColor: {type: String, default: null},
  relationCode: {type: String, default: null},
  notes: {type: String, default: null},
  concernedPerson: {type: String, default: null},
  created: {type: refId, ref: 'User'}
}, {versionKey: false, collection: 'returnInfos'});

module.exports = mongoose.model('ReturnInfo', model);
