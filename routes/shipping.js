var router = require('express').Router();
var dotenv = require('dotenv').config();
var ShippingController = require('../controllers/shippingController');
var controller = new ShippingController();

router.get(process.env.BASE_API + ShippingController.api + '/get', auth.isAuthenticated, function(req, res){
   controller.get(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(exception){
       return res.status(500).send(exception.message);
   });
});

router.getAll(process.env.BASE_API + ShippingController.api + '/getAll', auth.isAuthenticated, function(req, res){
    var parameters = controller.setParameters(JSON.parse(req.query['query']));
    controller.getAll(parameters).then(function(result){
        return res.status(200).send(result);
    }).catch(function(exception){
        return res.status(500).send(exception.message);
    });
});

router.post(process.env.BASE_API + ShippingController.api + '/add', auth.isAuthenticated, function(req, res){
    controller.setUser(req.session.user);
    controller.add().then(function(result){
       return res.status(200).send(result);
    }).catch(function(exception){
       return res.status(500).send(exception.message);
    });
});

router.post(process.env.BASE_API + ShippingController.api + '/update', auth.isAuthenticated, function(req, res){
    controller.setUser(req.session.user);
    controller.update().then(function(result){
       return res.status(200).send(result);
    }).catch(function(exception){
       return res.status(500).send(exception.message);
    });
});

router.delete(process.env.BASE_API + ShippingController.api + '/delete', auth.isAuthenticated, function(req, res){
    controller.delete(req.query.id).then(function(result){
       return res.status(200).send(result);
    }).catch(function(exception){
       return res.status(500).send(exception.message);
    });
});

module.exports = router;
