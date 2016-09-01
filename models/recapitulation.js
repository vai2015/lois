var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
   shipping: {type: refId, ref: 'Shipping'},
   shippingItem: {type: refId, ref: 'ShippingItem'},
   quantity: {type: Number, default: 0},
   available: {type: Number, default: 0},
   weight: {type: Number, default: 0},
   limasColor: {type: String, default: null},
   relationColor: {type: String, default: null},
   vehicleNumber: {type: String, default: null},
   departureDate: {type: Date, default: null},
   notes: {type: String, default: null},
   trainType: {type: refId, ref: 'TrainType'},
   driver: {type: refId, ref: 'Driver'},
   created: {
      user: {type: refId, ref: 'User'},
      date: {type: Date, default: null}
   },
   modified: {
      user: {type: refId, ref: 'User'},
      date: {type: Date, default: Date.now}
   }
}, {versionKey: false, collection: 'recapitulations'});

module.exports = mongoose.model('Recapitulation', model);
