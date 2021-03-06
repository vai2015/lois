var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/shipping');

router.get('/lois/shipping', function(req, res){
   res.redirect('/lois');
});

router.get(process.env.BASE_API + 'shipping/get', auth.isAuthenticated, function(req, res){
   controller.get(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'shipping/getAll', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['location'] = req.session.user.location._id;

   var parameters = controller.getParameters(query);
   controller.getAll(parameters).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'shipping/add', auth.isAuthenticated, function(req, res){
   var user = req.session.user;
   controller.add(user).then(function(result){
      return res.status(200).send(result);
   }).catch(function(error){
      return res.status(500).send(error.message);
   })
});

router.post(process.env.BASE_API + 'shipping/save', auth.isAuthenticated, function(req, res){
   var user = req.session.user;
   req.body.inputLocation = user.location._id;
   controller.save(req.body).then(function(result){
      return res.status(200).send(result);
   }).catch(function(error){
      return res.status(500).send(error.message);
   })
});

module.exports = router;
