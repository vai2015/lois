var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
   id: {type: Number, default: null},
   name: {type: String, required: true}
}, {versionKey: false, collection: 'trainTypes'});

module.exports = mongoose.model('TrainType', model);
