  var mongoose = require('mongoose');
  var debug = require('debug')('FacebookObject model');
  var FacebookObject = new mongoose.Schema({

    facebookId: Number,
    likes: Number,
    likers: {
      type: [{}],
      'default': []
    },
    createdDate: {
      type: Date,
      'default': Date.now
    },

  });

  debug('Loading the schema');
  var Account = mongoose.model('facebookObject', FacebookObject);

  exports = module.exports = FacebookObject;