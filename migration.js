var db = require('mysql-promise')();
var dotenv = require('dotenv').config();
var co = require('co');
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DSN);

db.configure({
   host     : process.env.MYSQL_MIGRATION_HOST,
   user     : process.env.MYSQL_MIGRATION_USER,
   password : '',
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

//migrateRegions();
//migrateLocations();
//migratePaymentTypes();
//migrateItemTypes();
//migratePackingTypes();
//migrateTrainTypes();
//migrateClients();
migrateTariffs(10000, 100000);
