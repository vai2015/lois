var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/client');

router.get(process.env.BASE_API + 'client/get', auth.isAuthenticated, function(req, res){
   controller.get(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'client/getAll', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['location'] = req.session.user.location._id;
   var parameters = controller.getParameters(query);
   controller.getAll(parameters).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

module.exports = router;
