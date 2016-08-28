var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/user');
var roleMenuController = require('../controllers/roleMenu');
var roleReportController = require('../controllers/roleReport');

router.get('/lois/login', function(req, res){
   res.redirect('/lois');
});

router.get(process.env.BASE_API + 'user/get', auth.isAuthenticated, function(req, res){
   controller.get(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'user/getAll', auth.isAuthenticated, function(req, res){
   var parameters = controller.getParameters(JSON.parse(req.query['query']));
   controller.getAll(parameters).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'user/authenticate', function(req, res){
  controller.authenticate(req.body.userName, req.body.password).then(function(user){
     req.session.user = user;
     var parameters = roleMenuController.getParameters({"role": user.role._id});
     roleMenuController.getAll(parameters).then(function(menus){
        req.session.menus = menus;
        roleReportController.getAll(parameters).then(function(reports){
           req.session.reports = reports;
           return res.status(200).send('OK');
        });

     }).catch(function(error){
        return res.status(500).send(error.message);
     })

  }).catch(function(error){
     return res.status(500).send(error.message);
  });
});

router.get(process.env.BASE_API + 'user/getSession', auth.isAuthenticated, function(req, res){
  return res.status(200).send({
    "name": req.session.user.name,
    "location": req.session.user.location.name,
    "role": req.session.user.role.name,
    "menus": req.session.menus,
    "reports": req.session.reports
 });
});

router.get(process.env.BASE_API + 'user/logout', auth.isAuthenticated, function(req, res){
  req.session.destroy(function(err) {
    if(err)
       return res.status(500).send(err);

     return res.status(200).send('Ok');
  });
});

router.post(process.env.BASE_API + 'user/save', auth.isAuthenticated, function(req, res){
   controller.save(req.body).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.delete(process.env.BASE_API + 'user/delete', auth.isAuthenticated, function(req, res){
   controller.delete(req.query.id).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

module.exports = router;
