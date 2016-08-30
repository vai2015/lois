var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/audit');

router.get('/lois/audit', function(req, res){
   res.redirect('/lois');
});

router.get(process.env.BASE_API + 'audit/getAll', auth.isAuthenticated, function(req, res){
   var parameters = controller.getParameters(JSON.parse(req.query['query']));
   controller.getAll(parameters).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'audit/process', auth.isAuthenticated, function(req, res){
   var data = req.body;

   if(data['status'] === 'approved'){
     controller.approve(data).then(function(result){
         return res.status(200).send(result);
     }).catch(function(error){
         return res.status(500).send(error.message);
     });
   }

   else if(data['status'] === 'rejected'){
     controller.reject(data).then(function(result){
         return res.status(200).send(result);
     }).catch(function(error){
         return res.status(500).send(error.message);
     });
   }

   else
     return res.status(400).send('method is not found');
});

module.exports = router;
