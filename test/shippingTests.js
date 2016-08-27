var mongoose = require('mongoose');
var co = require('co');
var should = require('chai').should();
var shippingController = require('../controllers/shipping');
var userController = require('../controllers/user');
var clientController = require('../controllers/client');
var locationController = require('../controllers/location');
var itemTypeController = require('../controllers/itemType');
var packingTypeController = require('../controllers/packingType');

describe('Add shipping', function(){
  it('Should add shipping without error', function(){
     return co(function*(){
        var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
        return yield shippingController.add(user);
     }).then(function(result){
        result.spbNumber.should.equal('1-S');
     });
  });
});

describe('Add shipping item', function(){
  it('Should add shipping item without error', function(){
      return co(function* (){
         var shipping = yield shippingController.getBySpbNumber('1-S');

         shipping.sender = yield clientController.get("57bee0b687d465dc17cc184d");
         shipping.destination = yield locationController.get("57bedddcc06122040d6263dd");

         shipping.items.push({
            "itemType": yield itemTypeController.get("57bedeaa6a797e9c1d9fdab0"),
            "packingType": yield packingTypeController.get("57beded4d0d7cc901d12f139"),
            "content": "Tas",
            "dimensions": {
              "length": 0,
              "width": 0,
              "height": 0,
              "weight": 100
            },
            "colli":{
              "quantity": 1000,
              "available": 1000,
              "delivered": 0
            },
            "cost":{
              "colli": 0,
              "additional": 0,
              "discount": 0,
              "shipping": 0
            },
            "discount": 0
         });

         shipping.items.push({
            "itemType": yield itemTypeController.get("57bedeaa6a797e9c1d9fdab1"),
            "packingType": yield packingTypeController.get("57beded4d0d7cc901d12f139"),
            "content": "Rantang",
            "dimensions": {
              "length": 10,
              "width": 20,
              "height": 30,
              "weight": 0
            },
            "colli":{
              "quantity": 1000,
              "available": 1000,
              "delivered": 0
            },
            "cost":{
              "colli": 0,
              "additional": 0,
              "discount": 0,
              "shipping": 0
            },
            "discount": 0
         });
         return yield shippingController.save(shipping);
      }).then(function(result){
          result.nModified.should.equal(1);
      });
  });
});
