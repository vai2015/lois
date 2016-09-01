var router = require('express').Router();
var dotenv = require('dotenv').config();
var auth = require('../utils/authentication');
var controller = require('../controllers/return');

var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/berita_acara/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.pdf')
    }
});

var upload = multer({ storage: storage });

router.post(process.env.BASE_API + 'return/uploads', upload.single('file'), function(req, res){
    res.status(200).send(req.file);
});

router.get('/lois/return', function(req, res){
   res.redirect('/lois');
});

router.get('/lois/confirm-return', function(req, res){
   res.redirect('/lois');
});

router.get(process.env.BASE_API + 'return/getAll', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultRegionDest'] = req.session.user.location.region;

   controller.getAll(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.get(process.env.BASE_API + 'return/getConfirmReturns', auth.isAuthenticated, function(req, res){
   var query = JSON.parse(req.query['query']);
   query['defaultLocation'] = req.session.user.location._id;
   controller.getConfirmReturns(query).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'return/return', auth.isAuthenticated, function(req, res){
   controller.return(req.body, req.session.user).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

router.post(process.env.BASE_API + 'return/confirm', auth.isAuthenticated, function(req, res){
   controller.confirm(req.body).then(function(result){
       return res.status(200).send(result);
   }).catch(function(error){
       return res.status(500).send(error.message);
   });
});

module.exports = router;
