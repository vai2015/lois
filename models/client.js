var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
   id: {type: Number, default: null},
   name: {type: String, required: true},
   address1: {type: String, default: null},
   address2: {type: String, default: null},
   contact: {type: String, default: null},
   quota: {type: String, default: null},
   location: {type: refId, ref: 'Location'}
}, {versionKey: false, collection: 'clients'});

module.exports = mongoose.model('Client', model);
