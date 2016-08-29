var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
   name: {type: String, required: true}
}, {versionKey: false, collection: 'reports'});

module.exports = mongoose.model('Report', model);
