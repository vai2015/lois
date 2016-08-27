var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
   id: {type: Number, default: null},
   name: {type: String, required: true},
   address: {type: String, default: null},
   contact: {type: String, default: null},
}, {versionKey: false, collection: 'partners'});

module.exports = mongoose.model('Partner', model);
