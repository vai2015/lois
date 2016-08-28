var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/delivery');

router.get('/lois/delivery', function(req, res){
   res.redirect('/lois');
});

router.get(process.env.BASE_API + 'delivery/getAll', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultRegionDest'] = req.session.user.location.region;
   controller.getAll(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'delivery/getAllCancel', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultRegionDest'] = req.session.user.location.region;
   controller.getAllCancel(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'delivery/delivery', auth.isAuthenticated, function(req, res){
   controller.delivery(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'delivery/cancelDelivery', auth.isAuthenticated, function(req, res){
   controller.cancelDelivery(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

module.exports = router;
