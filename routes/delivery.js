var router = require('express').Router();
var dotenv = require('dotenv').config();
var controller = require('../controllers/deliveryController');

router.get(process.env.BASE_API + controller.api + '/get', auth.isAuthenticated, function(req, res){
   controller.get(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(exception){
       return res.status(500).send(exception.message);
   });
});

router.getAll(process.env.BASE_API + controller.api + '/getAll', auth.isAuthenticated, function(req, res){
    controller.getAll(JSON.parse(req.query['query'])).then(function(result){
        return res.status(200).send(result);
    }).catch(function(exception){
        return res.status(500).send(exception.message);
    });
});

router.getAll(process.env.BASE_API + controller.api + '/getAllCancel', auth.isAuthenticated, function(req, res){
    controller.getAllCancel(req.query['query'])).then(function(result){
        return res.status(200).send(result);
    }).catch(function(exception){
        return res.status(500).send(exception.message);
    });
});

router.post(process.env.BASE_API + controller.api + '/deliver', auth.isAuthenticated, function(req, res){
  controller.deliver(req.body).then(function(result){
      return res.status(200).send(result);
  }).catch(function(exception){
      return res.status(500).send(exception.message);
  });
});

router.post(process.env.BASE_API + controller.api + '/cancelDeliver', auth.isAuthenticated, function(req, res){
  controller.cancelDeliver(req.body).then(function(result){
      return res.status(200).send(result);
  }).catch(function(exception){
      return res.status(500).send(exception.message);
  });
});

module.exports = router;