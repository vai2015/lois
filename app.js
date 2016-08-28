var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var session = require('express-session');
var compression = require('compression');
var dotenv = require('dotenv').config();
var mongoose = require('mongoose');
var app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(session({secret: 'sdfe34234fdff234fsdf', saveUninitialized: true, resave: true}));
app.use(require('./routes/user'));
app.use(require('./routes/region'));
app.use(require('./routes/location'));
app.use(require('./routes/trainType'));
app.use(require('./routes/driver'));
app.use(require('./routes/role'));
app.use(require('./routes/client'));
app.use(require('./routes/tariff'));
app.use(require('./routes/paymentType'));
app.use(require('./routes/itemType'));
app.use(require('./routes/packingType'));
app.use(require('./routes/partner'));
app.use(require('./routes/shipping'));
app.use(require('./routes/recapitulation'));
app.use(require('./routes/delivery'));
app.use(require('./routes/return'));
app.use(require('./routes/payment'));

if(process.env.MODE == 'production')
  app.use(compression());

app.listen(process.env.PORT, function(error){
   if(error)
      console.log(error);

   else{
     mongoose.connect(process.env.MONGO_DSN);

     mongoose.connection.on('open', function (ref) {
       console.log('Connected to mongo server.');
     });

     console.log('Server is running on port ' + process.env.PORT);
   }
});

app.get('/', function(req, res){
   res.redirect('/lois');
});

app.get('/lois', function(req, res){
   res.sendFile(__dirname + '/public/views/index.html');
});

app.get('/lois/home', function(req, res){
   res.sendFile(__dirname + '/public/views/index.html');
});

app.get('/lois/configuration', function(req, res){
   res.sendFile(__dirname + '/public/views/index.html');
});
