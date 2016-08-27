 var mongoose = require('mongoose');
 var should = require('chai').should();
 var dotenv = require('dotenv').config();
 var regionController = require('../controllers/region');
 var locationController = require('../controllers/location');
 var clientController = require('../controllers/client');
 var tariffController = require('../controllers/tariff');
 var driverController = require('../controllers/driver');
 var partnerController = require('../controllers/partner');
 var roleController = require('../controllers/role');
 var userController = require('../controllers/user');
 var roleMenuController = require('../controllers/roleMenu');
 var co = require('co');
 var objectId = mongoose.Types.ObjectId;

 mongoose.connect(process.env.MONGO_DSN_TEST);

 describe('Find single data', function(){
    it('Should retrieve single data for every model without error', function(){
       return co(function*(){
          var surabayaRegion = yield regionController.get("57bedc8254fae0c013130aa4");
          var surabayaLocation = yield locationController.get("57bedddcc06122040d6263c8");
          var idiClient = yield clientController.get("57bee0b687d465dc17cc184d");
          var idiTariff = yield tariffController.getTariff("57bee0b687d465dc17cc184d", "57bedddcc06122040d6263dd")

          return {
            'region': surabayaRegion,
            'location': surabayaLocation,
            'client': idiClient,
            'tariff': idiTariff
          }
       }).then(function(result){
           result.region.name.should.equal('Surabaya');
           result.location.name.should.equal('Surabaya');
           result.location.region.name.should.equal('Surabaya');
           result.client.name.should.equal('IDI');
           result.client.location.name.should.equal('Surabaya');
           result.tariff.minimum.should.equal(50000);
       });
    });
 });

 describe('Find many data (without parameter)', function(){
    it('Should retrieve many data for every model without error', function(){
       return co(function*(){
           var regions = yield regionController.getAll({});
           var locations = yield locationController.getAll({});
           var clients = yield clientController.getAll({});

           return {
             'regions': regions,
             'locations': locations,
             'clients': clients
           }
       }).then(function(result){
           result.regions.length.should.equal(6);
           result.locations.length.should.equal(74);
           result.clients.length.should.equal(9664);
       });
    });
 });

 describe('Find many data (with parameter)', function(){
    it('Should retrive proper data for every model (and every parameter) without error', function(){
        var regionParameters = regionController.getParameters({"name": "S"});
        var locationParameters = locationController.getParameters({"name": "S", "populations": ['region']});

        return co(function*(){
           var regions = yield regionController.getAll(regionParameters);
           var locations = yield locationController.getAll(locationParameters);

           return {
             'regions': regions,
             'locations': locations
           }

        }).then(function(result){
            result.regions.length.should.equal(3);
            result.locations.length.should.equal(23);
            result.locations[0].region.name.should.equal('Surabaya');
        });
    });
 });

 describe('Paging', function(){
   it('Should retrive only 10 data with various data (depends on skip) for every model', function(){
     var regionParameters = regionController.getParameters({"limit": 10, "skip": 0});
     var locationParameters = locationController.getParameters({"populations": ['region'], "limit": 10, "skip": 0});

     return co(function*(){
       var regions = yield regionController.getAll(regionParameters);
       var locations = yield locationController.getAll(locationParameters);

       return {
         'regions': regions,
         'locations': locations
       }
     }).then(function(result){
         result.regions.length.should.equal(6);
         result.locations.length.should.equal(10);
         result.locations[0].region.name.should.equal('Surabaya');
     });
   });
 });

 describe('Save model', function(){
    it('Should save model without error', function(){
       return co(function*(){
          var driverData = {"name": "Kosong"};
          var partnerData = {"name": "Kosong"};
          var driver = yield driverController.save(driverData);
          var partner = yield partnerController.save(partnerData);

          return {
            'driver': driver,
            'partner': partner
          }

       }).then(function(result){
          result.driver.name.should.equal('Kosong');
          result.partner.name.should.equal('Kosong');

          require('../models/driver').remove({}).exec();
          require('../models/partner').remove({}).exec();
       });
    });
 });

 describe('Update model', function(){
    it('Should update model without error', function(){
       var roleData = {_id: "57c14bebb495e502157d7ce9", name: "direktur"};

       return co(function* (){
           var result =  yield roleController.save(roleData);
           result.nModified.should.equal(1);
           return yield roleController.save({_id: "57c14bebb495e502157d7ce9", name: "manager"});
       });
    });
 });

 describe('Login', function(){
    it('Should retrive a correct user without error', function(){
        return co(function*(){
           var user = yield userController.authenticate('admin', 'admin');
           user.hash.should.equal("99a90237c75259e4f918edb9414734f3888321777840be4d19fd0d162661be4a");
        });
    });
 });

 describe('Get role menus', function(){
    it('Should retrieve correct menus for specific role', function(){
        return co(function*(){
           var parameters = yield roleMenuController.getParameters({"role": "57c02f99dd376f7ad0f33f1d"});
           var roleMenus = yield roleMenuController.getAll(parameters);
           roleMenus.length.should.equal(11);
        });
    });
 });
