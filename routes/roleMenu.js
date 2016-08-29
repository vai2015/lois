var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/roleMenu');

router.get(process.env.BASE_API + 'roleMenu/get', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);

   controller.get(query.id, query.role).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'roleMenu/getGroups', auth.isAuthenticated, function(req, res){
   controller.getGroups(JSON.parse(req.query['query'])).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'roleMenu/getAll', auth.isAuthenticated, function(req, res){
   controller.getAll(JSON.parse(req.query['query'])).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'roleMenu/save', auth.isAuthenticated, function(req, res){
   controller.save(req.body).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.delete(process.env.BASE_API + 'roleMenu/delete', auth.isAuthenticated, function(req, res){
   controller.delete(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

module.exports = router;
