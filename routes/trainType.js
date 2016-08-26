var router = require('express').Router();
var dotenv = require('dotenv').config();
var TrainTypeController = require('../controllers/trainTypeController');
var controller = new TrainTypeController();

router.get(process.env.BASE_API + TrainTypeController.api + '/get', auth.isAuthenticated, function(req, res){
   controller.get(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(exception){
       return res.status(500).send(exception.message);
   });
});

router.getAll(process.env.BASE_API + TrainTypeController.api + '/getAll', auth.isAuthenticated, function(req, res){
    var parameters = controller.getParameters(JSON.parse(req.query['query']));
    controller.getAll(parameters).then(function(result){
        return res.status(200).send(result);
    }).catch(function(exception){
        return res.status(500).send(exception.message);
    });
});

router.post(process.env.BASE_API + TrainTypeController.api + '/save', auth.isAuthenticated, function(req, res){
   var data = req.body;
   var api = controller.save;

   if(data['_id'])
     api = controller.update;

   api(data).then(function(result){
       return res.status(200).send(result);
   }).catch(function(exception){
       return res.status(500).send(exception.message);
   });
});

router.delete(process.env.BASE_API + TrainTypeController.api + '/delete', auth.isAuthenticated, function(req, res){
    controller.delete(req.query.id).then(function(result){
       return res.status(200).send(result);
    }).catch(function(exception){
       return res.status(500).send(exception.message);
    });
});

module.exports = router;
