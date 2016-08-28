var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/invoice');

router.get('/lois/invoice', function(req, res){
   res.redirect('/lois');
});

router.get(process.env.BASE_API + 'invoice/getAll', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultLocation'] = req.session.user.location._id;
   var parameters = controller.getParameters(query);
   controller.getAll(parameters).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'invoice/getList', auth.isAuthenticated, function(req, res){
   controller.getList(JSON.parse(req.query['query'])).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'invoice/create', auth.isAuthenticated, function(req, res){
   controller.create(req.body).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

module.exports = router;
