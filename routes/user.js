var router = require('express').Router();
var dotenv = require('dotenv').config();
var controller = require('../controllers/userController');
var auth = require('../utils/authentication');
var co = require('co');

router.get(process.env.BASE_API + controller.api + '/get', auth.isAuthenticated, function(req, res){
   controller.get(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(exception){
       return res.status(500).send(exception.message);
   });
});

router.getAll(process.env.BASE_API + controller.api + '/getAll', auth.isAuthenticated, function(req, res){
    var parameters = controller.setParameters(JSON.parse(req.query['query']));
    controller.getAll(parameters).then(function(result){
        return res.status(200).send(result);
    }).catch(function(exception){
        return res.status(500).send(exception.message);
    });
});

router.post(process.env.BASE_API + controller.api + '/save', auth.isAuthenticated, function(req, res){
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

router.post(process.env.BASE_API + controller.api + '/authenticate', function(req, res){
    var roleMenuController = require('../controllers/roleMenuController');
    var roleReportController = require('../controllers/roleReportController');

    co(function*(){
        var user = yield controller.authenticate(req.body.userName, req.body.password);
        var parameters['role'] = user.role;

        var reports = yield roleReportController.getAll(parameters);
        var menus = yield roleMenuController.getAll(parameters);

        req.session.user  = user;
        req.session.menus = menus;
        req.session.reports = reports;
        return res.status(200).send('Ok');
    }).catch(function(exception){
       return res.status(500).send(exception.message);
    });
});

router.delete(process.env.BASE_API + controller.api + '/delete', auth.isAuthenticated, function(req, res){
    controller.delete(req.query.id).then(function(result){
       return res.status(200).send(result);
    }).catch(function(exception){
       return res.status(500).send(exception.message);
    });
});

module.exports = router;
