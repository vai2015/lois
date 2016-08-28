var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/recapitulation');

router.get('/lois/recapitulation', function(req, res){
   res.redirect('/lois');
});

router.get(process.env.BASE_API + 'recapitulation/getAll', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultLocation'] = req.session.user.location._id;
   controller.getAll(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'recapitulation/getAllCancel', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultLocation'] = req.session.user.location._id;
   controller.getAllCancel(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'recapitulation/recap', auth.isAuthenticated, function(req, res){
   controller.recap(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'recapitulation/cancelRecap', auth.isAuthenticated, function(req, res){
   controller.cancelRecap(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

module.exports = router;
