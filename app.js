var express = require('express');
var compression = require('compression');
var dotenv = require('dotenv').config();

var app = express();

if(process.env.MODE == 'production')
  app.user(compression());

app.listen(process.env.PORT, function(error){
   if(error){
      console.log(error);
      return;
   }

   console.log('Server is running on port ' + process.env.PORT);
});
