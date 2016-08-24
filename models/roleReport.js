var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var refId = mongoose.Schema.Types.ObjectId;

var model = new Schema({
   id: {type: Number, default: null},
   name: {type: String, required: true},
   roles: [{type: refId, ref: 'Role'}]
}, {versionKey: false, collection: 'roleReports'});

module.exports = mongoose.model('RoleReport', model);
