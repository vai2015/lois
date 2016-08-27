var mongoose = require('mongoose');
var should = require('chai').should();

describe('Clean up', function(){
  it('Should clean up all shipping documents', function(){
    require('../models/shipping').remove({}).exec().then(function(result){});
    require('../models/notification').remove({}).exec().then(function(result){});
  });
});
