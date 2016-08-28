var db = require('mysql-promise')();
var dotenv = require('dotenv').config();
var co = require('co');
var mongoose = require('mongoose');

if(process.env.MODE == 'production')
  mongoose.connect(process.env.MONGO_DSN);
else if(process.env.MODE == 'development')
  mongoose.connect(process.env.MONGO_DSN_TEST);

db.configure({
   host     : process.env.MYSQL_MIGRATION_HOST,
   user     : process.env.MYSQL_MIGRATION_USER,
   password : process.env.MYSQL_MIGRATION_PASSWORD,
   database : process.env.MYSQL_MIGRATION_DB
});

var migrateRegions = function(){
   var model = require('./models/region');
   db.query('SELECT * FROM region').spread(function(results){
       for(var i=0; i<results.length; i++){
          var result = results[i];
          var data = new model({
             id: result.id,
             name: result.name
          });

          console.log(data);
          data.save(function(error){
              if(error)
                console.log(error);
              else
                console.log('Region ' + result.name + ' has been saved');
          });
       }
   }).catch(function(error){
      console.log(error);
  });
};

var migrateLocations = function(){
   var model = require('./models/location');
   var regionModel = require('./models/region');

   db.query('SELECT * FROM location').spread(function(results){
       co(function*(){
           for(var i=0; i<results.length; i++){
              var result = results[i];
              var region = yield regionModel.findOne({id: result.region_id});
              var data = new model({
                 id: result.id,
                 region: region._id,
                 name: result.name,
                 prefix: null
              });

              console.log(data);
              data.save(function(error){
                  if(error)
                    console.log(error);
                  else
                    console.log('Location ' + result.name + ' has been saved');
              });
           }
       });
   });
};

var migratePaymentTypes = function(){
   var model = require('./models/paymentType');

   db.query('SELECT * FROM payment_type').spread(function(results){
     for(var i=0; i<results.length; i++){
        var result = results[i];
        var data = new model({
           id: result.id,
           name: result.name
        });

        console.log(data);
        data.save(function(error){
            if(error)
              console.log(error);
            else
              console.log(result.name + ' has been saved');
        });
     }
   });
};

var migrateItemTypes = function(){
   var model = require('./models/itemType');

   db.query('SELECT * FROM item_type').spread(function(results){
     for(var i=0; i<results.length; i++){
        var result = results[i];
        var data = new model({
           id: result.id,
           name: result.name
        });

        console.log(data);
        data.save(function(error){
            if(error)
              console.log(error);
            else
              console.log(result.name + ' has been saved');
        });
     }
   });
};

var migratePackingTypes = function(){
   var model = require('./models/packingType');

   db.query('SELECT * FROM packing_type').spread(function(results){
     for(var i=0; i<results.length; i++){
        var result = results[i];
        var data = new model({
           id: result.id,
           name: result.name
        });

        console.log(data);
        data.save(function(error){
            if(error)
              console.log(error);
            else
              console.log(result.name + ' has been saved');
        });
     }
   });
};

var migrateTrainTypes = function(){
   var model = require('./models/trainType');

   db.query('SELECT * FROM train_type').spread(function(results){
     for(var i=0; i<results.length; i++){
        var result = results[i];
        var data = new model({
           id: result.id,
           name: result.name
        });

        console.log(data);
        data.save(function(error){
            if(error)
              console.log(error);
            else
              console.log(result.name + ' has been saved');
        });
     }
   });
};

var migrateClients = function(){
   var model = require('./models/client');
   var locationModel = require('./models/location');

   db.query('SELECT * FROM client').spread(function(results){
     co(function*(){
       console.log(results);
       for(var i=0; i<results.length; i++){
         try{
           var result = results[i];
           var loc = yield locationModel.findOne({id: result.location_id});
           var data = new model({
              id: result.id,
              name: result.name,
              address1: result.address1,
              address2: result.address2,
              contact: result.contact,
              quota: result.quota,
              location: loc._id
           });

           console.log(data);
           data.save(function(error){
               if(error)
                 console.log(error);
               else
                 console.log(result.name + ' has been saved');
           });
         }
         catch(error){
           console.log(error);
         }
        }
     });
   });
};

var migrateTariffs = function(limit, skip){
  var model = require('./models/tariff');
  var clientModel = require('./models/client');
  var locationModel = require('./models/location');

  db.query('SELECT * FROM client_price LIMIT ' + limit + ' OFFSET ' + skip).spread(function(results){
      co(function*(){
        try{


         for(var i=0; i<results.length; i++){
            var result = results[i];

            var location = yield locationModel.findOne({id: result.destination_id});
            var cli = yield clientModel.findOne({id: result.client_id});
            if(!location || !cli)
              continue;

            var data = new model({
               client: cli._id,
               destination: location._id,
               minimum: result.minimum_price,
               prices: [result.price1, result.price2, result.price3]
            });

            console.log(data);
            data.save(function(error){
                if(error)
                  console.log(error);
                else
                  console.log(result.name + ' has been saved');
            });
         }
       }
       catch(error){
          console.log(error);
       }
      });
  });
}

var migirateShippings = function(locationId, limit, skip){
  db.query('SELECT *,  SUBSTRING_INDEX(SUBSTRING_INDEX(spb_number, "-", 1)," ",1) as number ' +
            'FROM transaction WHERE input_location_id = ' + locationId + ' LIMIT ' + limit + ' OFFSET ' + skip).spread(function(rows){

     var clientModel = require('./models/client');
     var locationModel = require('./models/location');
     var regionModel = require('./models/region');
     var partnerModel = require('./models/partner');
     var paymentTypeModel = require('./models/paymentType');

     console.log(rows);
     co(function* (){
         var user = yield require('./models/user').findOne({id: 1});

         for(var i=0; i<rows.length; i++){
            var row = rows[i];
            var sender = yield clientModel.findOne({id: row.sender_id});
            var destination = yield rlocationModel.findOne({id: row.destination_id});
            var payType = yield paymentTypeModel.findOne({id: row.payment_type_id});
            var payLocation = yield locationModel.findOne({id: row.payment_location_id});
            var part = yield ppartnerModel.findOne({id: row.partner_id});
            var regionDest = yield regionModel.findOne({id: row.region_dest_id});
            var regionSource = yield regionModel.findOne({id: row.region_source_id});
            var inputLocation = yield locationModel.findOne({id: row.input_location_id});

            try{
              console.log(document);
              var document = new shipping({
                 number: row.id,
                 spbNumber: row.spb_number,
                 sender: sender._id,
                 destination: destination._id,
                 regions: {
                   "source": regionSource._id,
                   "destination": regionDest._id
                 },
                 date: ("0000-00-00" || "0000-00-00 00:00:00") ? null : row.date,
                 receiver: {name: row.receiver_name, address: row.receiver_address, contact: row.receiver_contact},
                 driver: row.driver,
                 partner: part._id,
                 payment: {
                   "type": payType._id,
                   "status": row.payment_status_id == 1 ? 'Belum Terbayar' : row.payment_status_id == 2 ? 'Terbayar Sebagian' : 'Terbayar',
                   "location": payLocation._id,
                   "phases": [],
                   "paid": row.paid
                 },
                 cost: {pph: row.pph_rate, total: 0.0, worker: row.worker_cost, expedition: row.expedition_cost},
                 notes:{
                   "shipping": row.notes,
                   "partner": null,
                   "po": row.po
                 },
                 audited: row.payment_approval_id != 2 ? false : true,
                 returned: false,
                 confirmed: false,
                 colli: {
                   quantity: 0,
                   delivered: 0
                 },
                 created:{
                   "by": user._id,
                   "date": ("0000-00-00" || "0000-00-00 00:00:00") ? null : row.createdAt
                 },
                 modified: {
                   "by": user._id,
                   "date": ("0000-00-00" || "0000-00-00 00:00:00") ? null : row.updatedAt
                 },
                 inputLocation: inputLocation._id,
                 items: []
              });

              document.save(function(error){
                  if(!error)
                    console.log('Data has been saved for spb ' + document.spbNumber);
                  else
                    console.log(error);
              });
            }
            catch(exception){
               console.log(exception);
            }

         }
     });
  }).catch(function(exception){
      console.log(exception);
  });
}

var migrateShippingItems = function(limit, skip){
   require('./schemas/shipping').find({}).limit(limit).skip(skip).exec().then(function(shippings){
       var counter = 0;
       shippings.forEach(function(data){
          db.query('SELECT * FROM item WHERE transaction_id = ' + data.number).spread(function(rows){
             co(function* (){
                data.totalCost = rows[0].price;

                for(var i=0; i<rows.length; i++){
                   var row = rows[i];
                   var itmType = yield require('./schemas/itemType').findOne({id: row.item_type_id});
                   var pkgType = yield require('./schemas/packingType').findOne({id: row.packing_type_id});

                   data.items.push({
                      itemType: itmType._id,
                      packingType: pkgType._id,
                      content: row.content,
                      dimensions: {
                        length: row.length,
                        width: row.width,
                        height: row.height,
                        weight: row.weight
                      },
                      colli: {
                        quantity: row.colli,
                        available: row.colli,
                        delivered: row.status_id === 5 ? row.colli : 0
                      },
                      cost: {
                        colli: row.colli_cost,
                        additional: row.additional_cost
                      },
                      discount: row.discount,
                      shippingCost: row.price,
                      status: row.status_id == 1 ? 'Belum Terekap' : row.status_id == 2 ? 'Terekap Sebagian' : row.status_id == 3 ? 'Terekap'
                            : row.status_id == 4 ? 'Terkirim Sebagian' : row.status_id == 5 ? 'Terkirim' : row.status_id == 6 ? 'Retur' : 'Surat Jalan Balik',
                      audited: row.changes_approval_id != 2 ? false : true,
                      returned: (row.status_id === 6 || row.status_id === 7) ? true : false,
                      confirmed: row.status_id === 7 ? true: false,
                      recapitulations:[],
                      deliveries: [],
                      returnInfo: {}
                   });

                   data.save(function(error){
                     if(!error)
                       console.log('Items has been added to ' + data.spbnumber + ' number ' + counter++);
                   });
                 }
             });
          });
       });
   })
}
//migrateRegions();
//migrateLocations();
//migratePaymentTypes();
//migrateItemTypes();
//migratePackingTypes();
//migrateTrainTypes();
//migrateClients();
//migrateTariffs(10000, 100000);
migirateShippings(1, 10000, 0);
