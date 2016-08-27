var mongoose = require('mongoose');
var co = require('co');
var should = require('chai').should();
var returnController = require('../controllers/return');
var userController = require('../controllers/user');
var shippingController = require('../controllers/shipping');

describe('Get all returns', function(){
  it('Should retrieve all items which are delivered', function(){
     return co(function* (){
         var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
         var parameters = returnController.getParameters({"defaultRegionDest": "57bedc8254fae0c013130aa8"});
         var returns = yield returnController.getAll(parameters);
         returns.length.should.equal(1);
     });
  });
});

describe('Return SPB', function(){
   it('Should return shipping', function(){
       return co(function*(){
         var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
         var parameters = returnController.getParameters({"defaultRegionDest": "57bedc8254fae0c013130aa8"});
         var returns = yield returnController.getAll(parameters);

         var viewModels = [{
           "shippingId": returns[0]._id,
           "filePath": "",
           "stamped": true,
           "signed": true,
           "accepted": true,
           "receipt": true,
           "limasColor": "HHH",
           "relationColor": "JJJ",
           "relationCode": "P",
           "notes": null,
           "concernedPerson": "Ujang"
         }];

         yield returnController.return(viewModels, user);

         var shipping = yield shippingController.getBySpbNumber('1-S');

         shipping.returned.should.equal(true);
       }).catch(function(error){
          console.log(error);
       });
   });
});

describe('Get all confirm returns', function(){
  it('Should retrieve all items which are returned', function(){
     return co(function* (){
         var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
         var parameters = {"defaultLocation": user.location._id};
         var confirmReturns = yield returnController.getConfirmReturns(parameters);

         confirmReturns.length.should.equal(1);
     });
  });
});

describe('Confirm', function(){
   it('Should confirm shippings without error', function(){
      return co(function*(){
        var user = yield userController.get("57c02f74dd376f7ad0f33f1c");
        var parameters = {"defaultLocation": user.location._id};
        var confirmReturns = yield returnController.getConfirmReturns(parameters);

        yield returnController.confirm(confirmReturns);
        var shipping = yield shippingController.getBySpbNumber('1-S');
        shipping.confirmed.should.equal(true);
      });
   });
})
