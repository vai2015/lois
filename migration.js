var db = require('mysql-promise')();
var dotenv = require('dotenv').config();
var co = require('co');
var _co = require('co-lodash');
var _ = require('lodash');
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DSN_TEST);

db.configure({
   host     : process.env.MYSQL_MIGRATION_HOST,
   user     : process.env.MYSQL_MIGRATION_USER,
   password : process.env.MYSQL_MIGRATION_PASSWORD,
   database : process.env.MYSQL_MIGRATION_DB
});

var regionModel = require('./models/region');
var roleModel = require('./models/role');
var paymentTypeModel = require('./models/paymentType');
var itemTypeModel = require('./models/itemType');
var packingTypeModel = require('./models/packingType');
var trainTypeModel = require('./models/trainType');
var driverModel = require('./models/driver');
var partnerModel = require('./models/partner');
var locationModel = require('./models/location');
var clientModel = require('./models/client');
var tariffModel = require('./models/tariff');
var shippingModel = require('./models/shipping');

function Migration(){}

Migration.migrateRegions = function(){
  var query = 'SELECT * FROM region';
  db.query(query).spread(function(rows){
    co(function*(){
       yield* _co.coEach(rows, function*(row){
         var data = new regionModel({number: row.id, name: row.name});
         yield data.save();

         console.log(data);
       });
    });
  }).catch(function(error){
     console.log(error);
  });
};

Migration.migrateRoles = function(){
  var query = 'SELECT * FROM role';
  db.query(query).spread(function(rows){
    co(function*(){
       yield* _co.coEach(rows, function*(row){
         var data = new roleModel({number: row.id, name: row.name});
         yield data.save();

         console.log(data);
       });
    });
  }).catch(function(error){
     console.log(error);
  });
};

Migration.migratePaymentTypes = function(){
  var query = 'SELECT * FROM payment_type';
  db.query(query).spread(function(rows){
    co(function*(){
       yield* _co.coEach(rows, function*(row){
         var data = new paymentTypeModel({number: row.id, name: row.name});
         yield data.save();

         console.log(data);
       });
    });
  }).catch(function(error){
     console.log(error);
  });
};

Migration.migrateItemTypes = function(){
  var query = 'SELECT * FROM item_type';
  db.query(query).spread(function(rows){
    co(function*(){
       yield* _co.coEach(rows, function*(row){
         var data = new itemTypeModel({number: row.id, name: row.name});
         yield data.save();

         console.log(data);
       });
    });
  }).catch(function(error){
     console.log(error);
  });
};

Migration.migratePackingTypes = function(){
  var query = 'SELECT * FROM packing_type';
  db.query(query).spread(function(rows){
    co(function*(){
       yield* _co.coEach(rows, function*(row){
         var data = new packingTypeModel({number: row.id, name: row.name});
         yield data.save();

         console.log(data);
       });
    });
  }).catch(function(error){
     console.log(error);
  });
};

Migration.migratePackingTypes = function(){
  var query = 'SELECT * FROM packing_type';
  db.query(query).spread(function(rows){
    co(function*(){
       yield* _co.coEach(rows, function*(row){
         var data = new packingTypeModel({number: row.id, name: row.name});
         yield data.save();

         console.log(data);
       });
    });
  }).catch(function(error){
     console.log(error);
  });
};

Migration.migrateTrainTypes = function(){
  var query = 'SELECT * FROM train_type';
  db.query(query).spread(function(rows){
    co(function*(){
       yield* _co.coEach(rows, function*(row){
         var data = new trainTypeModel({number: row.id, name: row.name});
         yield data.save();

         console.log(data);
       });
    });
  }).catch(function(error){
     console.log(error);
  });
};

Migration.migrateDrivers = function(){
  var query = 'SELECT * FROM driver';
  db.query(query).spread(function(rows){
    co(function*(){
       yield* _co.coEach(rows, function*(row){
         var data = new driverModel({number: row.id, name: row.name});
         yield data.save();

         console.log(data);
       });
    });
  }).catch(function(error){
     console.log(error);
  });
};

Migration.migratePartners = function(){
  var query = 'SELECT * FROM partner';
  db.query(query).spread(function(rows){
    co(function*(){
       yield* _co.coEach(rows, function*(row){
         var data = new partnerModel({number: row.id, name: row.name, address: row.address, contact: row.contact});
         yield data.save();

         console.log(data);
       });
    });
  }).catch(function(error){
     console.log(error);
  });
};

Migration.migrateLocations = function(){
   var query = 'SELECT * FROM location';
   db.query(query).spread(function(rows){
     co(function*(){
        yield* _co.coEach(rows, function*(row){
          var region = yield regionModel.findOne({"number": row.region_id});
          var data = new locationModel({number: row.id, name: row.name, prefix: null, region: region._id});
          yield data.save();

          console.log(data);
        });
     });
   }).catch(function(error){
      console.log(error);
   });
};

Migration.migrateClients = function(){
   var query = 'SELECT * FROM client';
   db.query(query).spread(function(rows){
     var id = _.map(rows, 'id');
     console.log("Fetching id " + id);

     co(function*(){
        yield* _co.coEach(rows, function*(row){
          var location = yield locationModel.findOne({"number": row.location_id});

          var data = new clientModel({
            number: row.id,
            name: row.name == '' ? ' ' : row.name,
            address1: row.address1,
            address2: row.address2,
            contact: row.contact,
            quota: row.quota,
            location: location._id
          });

          yield data.save();
          console.log(data);
        });
     }).catch(function(error){
        console.log(error);
     });
   }).catch(function(error){
      console.log(error);
   });
};

Migration.migrateTariffs = function(limit, skip){
  var query = 'SELECT * FROM client_price LIMIT ' + limit + ' OFFSET ' + skip;
  db.query(query).spread(function(rows){
    var id = _.map(rows, 'id');
    console.log("Fetching id " + id);

    co(function*(){
       yield* _co.coEach(rows, function*(row){
          var client = yield clientModel.findOne({"number": row.client_id});
          var location = yield locationModel.findOne({"number": row.destination_id});

          var data = new tariffModel({
             client: client._id,
             destination: location._id,
             minimum: row.minimum_price,
             prices: [row.price1, row.price2, row.price3]
          });

          yield data.save();
          console.log(data);
       });
    });
  });
};

Migration.migrateShippings = function(locationId, limit, skip){
   var query = 'SELECT *, SUBSTRING_INDEX(SUBSTRING_INDEX(spb_number, "-", 1)," ",1) as number FROM transaction a LEFT JOIN data b ON a.data_id = b.id ' +
               'WHERE b.location_id = ' + locationId + ' LIMIT ' + limit + ' OFFSET ' + skip;

   db.query(query).spread(function(rows){
       var id = _.map(rows, 'spb_number');
       console.log("Fetching spb number " + id);

       co(function* (){
           yield* _co.coEach(rows, function*(row){
              var inputLocation = yield locationModel.findOne({"number": locationId});
              var sender = yield clientModel.findOne({"number": row.sender_id});
              var destination = yield locationModel.findOne({"number": row.destination_id});
              var regionSource = yield regionModel.findOne({"number": row.region_source_id});
              var regionDest = yield regionModel.findOne({"number": row.region_dest_id});
              var partner = yield partnerModel.findOne({"number": row.partner_id});
              var paymentType = yield paymentTypeModel.findOne({"number": row.payment_type_id});
              var paymentLocation = yield locationModel.findOne({"number": row.payment_location_id});

              var data = new shippingModel({
                 number: row.id,
                 spbNumber: row.spb_number,
                 date: row.date === ("0000-00-00" || "0000-00-00 00:00:00") ? null : row.date,
                 sender: sender._id,
                 destination: destination._id,
                 regions: {
                    source: regionSource._id,
                    destination: regionDest._id
                 },
                 partner: partner._id,
                 payment: {
                    type: paymentType._id,
                    location: paymentLocation._id,
                    status: row.payment_status_id == 1 ? 'Belum Terbayar' : row.payment_status_id == 2 ? 'Terbayar Sebagian' : 'Terbayar',
                    phases: [],
                    paid: row.paid
                 },
                 cost: {
                    pph: row.pph_rate,
                    worker: row.worker_cost,
                    expedition: row.expedition_cost,
                    total: row.total
                 },
                 notes: {
                    shipping: row.notes,
                    partner: null,
                    po: row.po
                 },
                 invoice:{
                    all: row.invoice_number,
                    client: row.client_invoice_number,
                    partner: row.partner_invoice_number
                 },
                 audited: row.payment_approval_id != 2 ? false : true,
                 inputLocation: inputLocation._id,
                 created: {
                    date: ("0000-00-00" || "0000-00-00 00:00:00") ? null : row.created_date,
                    user: null
                 },
                 modified: {
                    date: ("0000-00-00" || "0000-00-00 00:00:00") ? null : row.updated_date,
                    user: null
                 }
              });

              yield data.save();
              console.log(data);
           });
       }).catch(function(error){
          console.log(error);
       });
   }).catch(function(error){
      console.log(error);
   });
};

Migration.migrateShippingItems = function(limit, skip){
   var query = 'SELECT * FROM shipment LIMIT ' + limit + ' OFFSET ' + skip;
   db.query(query).spread(function(rows){
       co(function*(){
           var colliQuantity = 0;
           var colliDelivered = 0;

           yield* _co.coEach(rows, function*(row){
             var shipping = yield shippingModel.findOne({"number": row.id}).exec();
             console.log(row);
             if(!shipping)
               return;

               shipping.items = [];
               var item = {
                   itemType: yield itemTypeModel.findOne({"number": row.item_type_id}),
                   packingType: yield packingTypeModel.findOne({"number": row.packing_type_id}),
                   content: row.content,
                   dimensions: {
                      length: row.length,
                      width: row.width,
                      height: row.height,
                      weight: row.weight
                   },
                   colli: {
                      quantity: row.colli,
                      available: row.colli - (row.belum_terekap + row.terekap + row.terkirim),
                      delivered: row.terkirim
                   },
                   cost: {
                      colli: row.colli_cost,
                      additional: row.additional_cost,
                      discount: row.discount,
                      shipping: row.price
                   },
                   status: row.status_id === 1 ? 'Belum Terekap' : row.status_id === 2 ? 'Terekap Sebagian' : row.status_id === 3 ? 'Terekap'
                         : row.status_id === 4 ? 'Terkirim Sebagian' : row.status_id === 5 ? 'Terkirim' : null,
                   audited: row.changes_approval_id != 2 ? false : true,
                   recapitulations: [],
                   deliveries: []
               };

               shipping.items.push(item);
               shipping.colli.quantity = row.colli;
               shipping.colli.delivered = row.terkirim;

               yield shipping.save();
               console.log(item);
           });
       }).catch(function(error){
          console.log(error);
       });
   }).catch(function(error){
      console.log(error);
   });
}

//Migration.migrateRegions();
//Migration.migrateRoles();
//Migration.migratePaymentTypes();
//Migration.migrateItemTypes();
//Migration.migratePackingTypes();
//Migration.migrateTrainTypes();
//Migration.migrateDrivers();
//Migration.migratePartners();
//Migration.migrateLocations();
//Migration.migrateClients();
//Migration.migrateTariffs(100000, 0);

//Parameter 1 = location id, parameter 2 = limit, parameter 3 = skip
//Migration.migrateShippings(24, 100000, 100000);

//Parameter 1 = limit, parameter 2 = skip
Migration.migrateShippingItems(271495, 0);
