var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = Schema({
   number: {type: Number, required: true},
   spbNumber: {type: String, required: true},
   date: {type: Date, default: null},
   driver: {type: String, default: null},
   receiver: {
      name: {type: String, default: null},
      address: {type: String, default: null},
      contact: {type: String, default: null}
   },
   sender: {type: refId, ref: 'Client'},
   destination: {type: refId, ref: 'Location'},
   partner: {type: refId, ref: 'Partner'},
   payment: {
      type: {type: refId, ref: 'PaymentType'},
      location: {type: refId, ref: 'Location'},
      status: {type: String, default: 'Belum Terbayar'},
      phases: [{
         date: {type: Date, default: null},
         bank: {type: String, default: null}.
         notes: {type: String, default: null},
         amount: {type: Number, default: 0.0}
      }],
      paid: {type: Number, default: 0.0}
   },
   regions: {
      source: {type: refId, ref: 'Region'},
      destination: {type: refId, ref: 'Region'}
   },
   cost: {
      pph: {type: Number, default: 0.0},
      worker: {type: Number, default: 0.0},
      expedition: {type: Number, default: 0.0},
      total: {type: Number, default: 0.0}
   },
   notes: {
      shipping: {type: String, default: null},
      partner: {type: String, default: null},
      po: {type: String, default: null}
   },
   invoices: {
      all: {type: String, default: null},
      client: {type: String, default: null},
      partner: {type: String, default: null}
   },
   tariff: {type: Number, default: 0},
   audited: {type: Boolean, default: false},
   created: {
      date: {type: Date, default: null},
      by: {type: refId, ref: 'User'}
   },
   modified: {
      date: {type: Date, default: Date.now},
      by: {type: refId, ref: 'User'}
   },
   items: [{
      
   }]
}, {versionKey: false, collection: 'shippings'})
