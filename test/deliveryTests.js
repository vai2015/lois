var mongoose = require('mongoose');
var co = require('co');
var should = require('chai').should();
var shippingController = require('../controllers/shipping');
var deliveryController = require('../controllers/delivery');
var userController = require('../controllers/user');

describe('Get all delivery', function(){
  it('Should retrieve all items which are available > 0', function(){
     return co(function* (){
         var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
         var shipping = yield shippingController.getBySpbNumber('1-S');
         var recapQuery = {"defaultRegionDest": "57bedc8254fae0c013130aa8"};
         var deliveries = yield deliveryController.getAll(recapQuery);

         deliveries.length.should.equal(2);
     });
  });
});

describe('Basic delivery 1', function(){
  it('Should deliver items and change status to Terkirim Sebagian', function(){
     return co(function* (){
         var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
         var shipping = yield shippingController.getBySpbNumber('1-S');
         var query = {"defaultRegionDest": "57bedc8254fae0c013130aa8"};
         var deliveries = yield deliveryController.getAll(query);

         var viewModels = [{
            "shippingId": shipping._id,
            "itemId": deliveries[0].items._id,
            "recapitulationId": deliveries[0].items.recapitulations._id,
            "quantity": 500,
            "limasColor": "HHH",
            "relationColor": "TTT",
            "vehicleNumber": "B1234532",
            "deliveryCode": "P1",
            "driverId": "57c18420b495e502157d7cec",
            "notes": "Test"
         }];

         yield deliveryController.delivery(viewModels, user);

         var shippingAfter = yield shippingController.getBySpbNumber('1-S');
         shippingAfter.items[1].deliveries.length.should.equal(1);
         shippingAfter.items[1].status.should.equal('Terkirim Sebagian');
     });
  });
});

describe('Basic delivery 2', function(){
  it('Should deliver items and change status to Terkirim', function(){
     return co(function* (){
         var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
         var shipping = yield shippingController.getBySpbNumber('1-S');
         var query = {"defaultRegionDest": "57bedc8254fae0c013130aa8"};
         var deliveries = yield deliveryController.getAll(query);

         var viewModels = [{
            "shippingId": shipping._id,
            "itemId": deliveries[0].items._id,
            "recapitulationId": deliveries[0].items.recapitulations._id,
            "quantity": 500,
            "limasColor": "HHH",
            "relationColor": "TTT",
            "vehicleNumber": "B1234532",
            "deliveryCode": "P1",
            "driverId": "57c18420b495e502157d7cec",
            "notes": "Test"
         }];

         yield deliveryController.delivery(viewModels, user);

         var shippingAfter = yield shippingController.getBySpbNumber('1-S');
         shippingAfter.items[1].deliveries.length.should.equal(2);
         shippingAfter.items[1].status.should.equal('Terkirim');
     });
  });
});
