var Model = require('./model');

module.exports = function listModelFactory ( namespace ) {

  var ListModel = Model.factory();

  ListModel.namespace = namespace || false;

  ListModel.length = function(key){
    var deferred = this.defer();
    key = this.appendNamespace(key);

    this.client.llen(key, function(e, r){
      if (e) {return deferred.reject(e);};
      deferred.resolve(r);
    });
    return deferred;
  };

  ListModel.push = function(key, element){
    var deferred = this.defer();
    key = this.appendNamespace(key);

    this.client.rpush(key, element, function(e, r){
      if (e) {return deferred.reject(e);};
      deferred.resolve(r);
    });

    return deferred;
  };


  ListModel.findRange = function(key, start, stop){
    var deferred = this.defer();
    key = this.appendNamespace(key);

    this.client.lrange(key, start, stop, function(e, r){
      if (e) {return deferred.reject(e);};
      deferred.resolve(r);
    });

    return deferred;
  };


  ListModel.findAll = function (key) {
    return this.findRange(key, 0, -1);
  };


  ListModel.pop = function (key) {
    var deferred = this.defer();
    key = this.appendNamespace(key);

    this.client.rpop(key, function(e, r){
      if (e) {return deferred.reject(e);};
      deferred.resolve(r);
    });

    return deferred;
  };


    ListModel.shift = function (key) {
    var deferred = this.defer();
    key = this.appendNamespace(key);

    this.client.lpop(key, function(e, r){
      if (e) {return deferred.reject(e);};
      deferred.resolve(r);
    });

    return deferred;
  };

  return ListModel;
};