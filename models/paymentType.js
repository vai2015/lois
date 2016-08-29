var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
   number: {type: Number, default: null},
   name: {type: String, required: true}
}, {versionKey: false, collection: 'paymentTypes'});

module.exports = mongoose.model('PaymentType', model);
