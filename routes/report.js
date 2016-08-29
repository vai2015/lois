var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/report');

router.get(process.env.BASE_API + 'report/get', auth.isAuthenticated, function(req, res){
   controller.get(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'report/getAll', auth.isAuthenticated, function(req, res){
   var parameters = controller.getParameters(JSON.parse(req.query['query']));
   controller.getAll(parameters).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'report/save', auth.isAuthenticated, function(req, res){
   controller.save(req.body).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.delete(process.env.BASE_API + 'report/delete', auth.isAuthenticated, function(req, res){
   controller.delete(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

module.exports = router;
