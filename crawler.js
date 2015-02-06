var debug = require('debug')('facebook');
var FB = require('fbgraph');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('underscore');

debug('Configuring the Facebook crawler');

var configuration = require('./configuration/configuration.json');
FB.setAccessToken(configuration.facebook.token);

Promise.promisifyAll(FB);
Promise.promisifyAll(mongoose);

debug('Facebook crawler configured');

var saveData = function(id, data) {
  debug('Saving the data');

  debug(data);

  var likers = data.data;
  var count = data.summary.total_count;

  var handlePagination = function(next) {

    return FB.getAsync(next)
      .then(function(data) {
        likers = likers.concat(data.data);

        return Promise.resolve();
      });
  };

  if (data.paging && data.paging.next) {
    var next = data.paging.next;
    return handlePagination(next);
  } else {

    var rawStats = {
      facebookId: id,
      likers: likers,
      likes: count
    };

    var FacebookObject = mongoose.model('facebookObject');

    return (new FacebookObject(rawStats)).saveAsync();
  }

};

var getLikes = function(id) {
  debug('Getting the likes for the objects %s', id);

  return FB.getAsync('/' + id + '/likes', {
      summary: true
    })
    .then(_.partial(saveData, id))
    .catch(function(err) {
      debug('An error occurred');
      debug(err);
      throw err;
    });
};

var confingMongo = function() {
  debug('Configuring the database');
  mongoose.connect(configuration.db);
  db = mongoose.connection;
  FacebookObject = require('./model/facebookObject.js');
};

confingMongo();

var ids = configuration.ids;

function crawl() {
  var promises = [];

  _.each(ids, function(id) {
    promises.push(getLikes(id));
  });

  return Promise
    .all(promises)
    .then(function() {
      debug('Iteration done');
    })
    .delay(900000)
    .then(crawl);
}

crawl();