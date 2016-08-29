var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/reportData');

router.get('/lois/report', function(req, res){
   res.redirect('/lois');
});

router.get(process.env.BASE_API + 'reportData/getRecapitulations', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultLocation'] = req.session.user.location._id;
   controller.getRecapitulations(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'reportData/getRecapitulationsReport', auth.isAuthenticated, function(req, res){
   controller.getRecapitulationsReport(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'reportData/getDeliveries', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultRegion'] = req.session.user.location.region;
   controller.getDeliveries(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'reportData/getDeliveriesReport', auth.isAuthenticated, function(req, res){
   controller.getDeliveriesReport(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'reportData/getReturn', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultRegion'] = req.session.user.location.region;
   controller.getReturn(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'reportData/getReturnReport', auth.isAuthenticated, function(req, res){
   controller.getReturnReport(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'reportData/getUnconfirmed', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultLocation'] = req.session.user.location._id;
   controller.getUnconfirmed(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'reportData/getUnconfirmedReport', auth.isAuthenticated, function(req, res){
   controller.getUnconfirmedReport(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'reportData/getPaid', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultLocation'] = req.session.user.location._id;
   controller.getPaid(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'reportData/getPaidReport', auth.isAuthenticated, function(req, res){
   controller.getPaidReport(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'reportData/getUnpaid', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultLocation'] = req.session.user.location._id;
   controller.getUnpaid(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'reportData/getUnpaidReport', auth.isAuthenticated, function(req, res){
   controller.getUnpaidReport(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'reportData/getDeliveryList', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultLocation'] = req.session.user.location._id;
   controller.getDeliveryList(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'reportData/getDeliveryListReport', auth.isAuthenticated, function(req, res){
   controller.getDeliveryListReport(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'reportData/getCommisions', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultLocation'] = req.session.user.location._id;
   controller.getCommisions(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'reportData/getCommisionsReport', auth.isAuthenticated, function(req, res){
   controller.getCommisionsReport(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'reportData/getInvoiceReport', auth.isAuthenticated, function(req, res){
   controller.getInvoiceReport(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

module.exports = router;
