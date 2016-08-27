var mongoose = require('mongoose');
var co = require('co');
var should = require('chai').should();
var shippingController = require('../controllers/shipping');
var recapitulationController = require('../controllers/recapitulation');
var userController = require('../controllers/user');

describe('Get all recap', function(){
  it('Should retrieve all items which are available > 0', function(){
     return co(function* (){
         var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
         var shipping = yield shippingController.getBySpbNumber('1-S');
         var recapQuery = {"defaultLocation": user.location._id};

         var recapitulations = yield recapitulationController.getAll(recapQuery);

         recapitulations.length.should.equal(2);
     });
  });
});

describe('Basic recapitulation 1', function(){
    it('Should recap items and change status to Terekap Sebagian', function(){
      return co(function* (){
          var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
          var shipping = yield shippingController.getBySpbNumber('1-S');
          var recapQuery = {"defaultLocation": user.location._id};

          var recapitulations = yield recapitulationController.getAll(recapQuery);

          var viewModels = [{
             "shippingId": shipping._id,
             "itemId": recapitulations[0].items._id,
             "quantity": 500,
             "trainTypeId": "57bedef6b8b62a60276488ef",
             "limasColor": "HHH",
             "relationColor": "TTT",
             "departureDate": 1472256000000,
             "vehicleNumber": "B1234532",
             "driverId": "57c18420b495e502157d7cec",
             "notes": "Test"
          },{
            "shippingId": shipping._id,
            "itemId": recapitulations[1].items._id,
            "quantity": 500,
            "trainTypeId": "57bedef6b8b62a60276488ef",
            "limasColor": "HHH",
            "relationColor": "TTT",
            "departureDate": 1472256000000,
            "vehicleNumber": "B1234532",
            "driverId": "57c18420b495e502157d7cec",
            "notes": "Test"
          }];

          yield recapitulationController.recap(viewModels, user);

          var shippingAfter = yield shippingController.getBySpbNumber('1-S');

          shippingAfter.items[0].recapitulations.length.should.equal(1);
          shippingAfter.items[0].recapitulations[0].quantity.should.equal(500);
          shippingAfter.items[0].status.should.equal('Terekap Sebagian');
      }).catch(function(error){
          console.log(error);
      });
   });
});

describe('Basic recapitulation 2', function(){
    it('Should recap items and change status to Terekap', function(){
      return co(function* (){
          var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
          var shipping = yield shippingController.getBySpbNumber('1-S');
          var recapQuery = {"defaultLocation": user.location._id};

          var recapitulations = yield recapitulationController.getAll(recapQuery);

          var viewModels = [{
             "shippingId": shipping._id,
             "itemId": recapitulations[0].items._id,
             "quantity": 500,
             "trainTypeId": "57bedef6b8b62a60276488ef",
             "limasColor": "HHH",
             "relationColor": "TTT",
             "departureDate": 1472256000000,
             "vehicleNumber": "B1234532",
             "driverId": "57c18420b495e502157d7cec",
             "notes": "Test"
          },{
            "shippingId": shipping._id,
            "itemId": recapitulations[1].items._id,
            "quantity": 500,
            "trainTypeId": "57bedef6b8b62a60276488ef",
            "limasColor": "HHH",
            "relationColor": "TTT",
            "departureDate": 1472256000000,
            "vehicleNumber": "B1234532",
            "driverId": "57c18420b495e502157d7cec",
            "notes": "Test"
          }];

          yield recapitulationController.recap(viewModels, user);

          var shippingAfter = yield shippingController.getBySpbNumber('1-S');

          shippingAfter.items[0].recapitulations.length.should.equal(2);
          shippingAfter.items[0].status.should.equal('Terekap');
      }).catch(function(error){
          console.log(error);
      });
   });
});

describe('Cancel recapitulation', function(){
    it('Should recap items and change status to Belum Terekap', function(){
      return co(function* (){
          var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
          var shipping = yield shippingController.getBySpbNumber('1-S');
          var recapQuery = {"defaultLocation": user.location._id};

          var recapitulations = yield recapitulationController.getAllCancel(recapQuery);

          var viewModels = [{
             "shippingId": shipping._id,
             "itemId": recapitulations[0].items._id,
             "recapitulationId": recapitulations[0].items.recapitulations._id,
             "quantity": 500,
             "trainTypeId": "57bedef6b8b62a60276488ef",
             "limasColor": "HHH",
             "relationColor": "TTT",
             "departureDate": 1472256000000,
             "vehicleNumber": "B1234532",
             "driverId": "57c18420b495e502157d7cec",
             "notes": "Test"
          },{
            "shippingId": shipping._id,
            "itemId": recapitulations[1].items._id,
            "recapitulationId": recapitulations[1].items.recapitulations._id,
            "quantity": 500,
            "trainTypeId": "57bedef6b8b62a60276488ef",
            "limasColor": "HHH",
            "relationColor": "TTT",
            "departureDate": 1472256000000,
            "vehicleNumber": "B1234532",
            "driverId": "57c18420b495e502157d7cec",
            "notes": "Test"
          }];

          yield recapitulationController.cancelRecap(viewModels, user);

          var shippingAfter = yield shippingController.getBySpbNumber('1-S');
          shippingAfter.items[0].recapitulations.length.should.equal(2);
          shippingAfter.items[0].status.should.equal('Belum Terekap');
      }).catch(function(error){
          console.log(error);
      });
   });
});

describe('Recapitulation 3', function(){
    it('Should recap items and change status to Terekap', function(){
      return co(function* (){
          var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
          var shipping = yield shippingController.getBySpbNumber('1-S');
          var recapQuery = {"defaultLocation": user.location._id};

          var recapitulations = yield recapitulationController.getAll(recapQuery);

          var viewModels = [{
             "shippingId": shipping._id,
             "itemId": recapitulations[0].items._id,
             "quantity": 500,
             "trainTypeId": "57bedef6b8b62a60276488ef",
             "limasColor": "HHH",
             "relationColor": "TTT",
             "departureDate": 1472256000000,
             "vehicleNumber": "B1234532",
             "driverId": "57c18420b495e502157d7cec",
             "notes": "Test"
          },{
            "shippingId": shipping._id,
            "itemId": recapitulations[0].items._id,
            "quantity": 500,
            "trainTypeId": "57bedef6b8b62a60276488ef",
            "limasColor": "HHH",
            "relationColor": "TTT",
            "departureDate": 1472256000000,
            "vehicleNumber": "B1234532",
            "driverId": "57c18420b495e502157d7cec",
            "notes": "Test"
          }];

          yield recapitulationController.recap(viewModels, user);

          var shippingAfter = yield shippingController.getBySpbNumber('1-S');

          shippingAfter.items[0].recapitulations.length.should.equal(4);
          shippingAfter.items[0].status.should.equal('Terekap');
      }).catch(function(error){
          console.log(error);
      });
   });
});
