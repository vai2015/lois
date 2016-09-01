var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/home');

router.get('/lois/home', function(req, res){
    res.redirect('/lois');
});

router.get(process.env.BASE_API + 'home/getOverall', auth.isAuthenticated, function(req, res){
   controller.getOverall(JSON.parse(req.query['query']), req.session.user).then(function(result){
      return res.status(200).send(result);
   }).catch(function(error){
      return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'home/getDestinations', auth.isAuthenticated, function(req, res){
   controller.getDestinations(JSON.parse(req.query['query']), req.session.user).then(function(result){
      return res.status(200).send(result);
   }).catch(function(error){
      return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'home/getSenders', auth.isAuthenticated, function(req, res){
   controller.getSenders(JSON.parse(req.query['query']), req.session.user).then(function(result){
      return res.status(200).send(result);
   }).catch(function(error){
      return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'home/getPaymentTypes', auth.isAuthenticated, function(req, res){
   controller.getPaymentTypes(JSON.parse(req.query['query']), req.session.user).then(function(result){
      return res.status(200).send(result);
   }).catch(function(error){
      return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'home/getPaymentStatuses', auth.isAuthenticated, function(req, res){
   controller.getPaymentStatuses(JSON.parse(req.query['query']), req.session.user).then(function(result){
      return res.status(200).send(result);
   }).catch(function(error){
      return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'home/getRegions', auth.isAuthenticated, function(req, res){
   controller.getRegions(JSON.parse(req.query['query']), req.session.user).then(function(result){
      return res.status(200).send(result);
   }).catch(function(error){
      return res.status(500).send(error.message);
   });
});

module.exports = router;
