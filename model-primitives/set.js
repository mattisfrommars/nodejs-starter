var Model = require('./model');

module.exports = function setModelFactory ( namespace ) {

  var SetModel = Model.factory();

  SetModel.namespace = namespace || false;

  SetModel.find = function ( id ) {

    var deferred = this.defer();
    var self = this;

    var key = this.appendNamespace( id );

    this.client.smembers( key, function ( e, r ) {
      if (e) { return deferred.reject( e ); }
      r = self.parse( r );
      return deferred.resolve( r );
    } );

    return deferred;

  };

  SetModel.parse = function ( model ) {
    var self = this;
    if ( typeof this.parseMap !== 'function' ) { return model; }
    for ( var i = 0, l = model.length; i < l; i++ ) {
      model[i] = this.parseMap(model[i]);
    }
    return model;
  };

  SetModel.push = function ( key, val ) {

    var deferred = this.defer();

    key = this.appendNamespace( key );

    this.client.sadd( key, val, function ( e, r ) {
      if (e) { return deferred.reject( e ); }
      return deferred.resolve(r);
    } );

    return deferred;

  };

  SetModel.remove = function ( key, member ) {
    var deferred = this.defer();
    key = this.appendNamespace( key );
    this.client.srem( key , member, function( e,r ){
      if ( e ) { return deferred.reject(e); }
      return deferred.resolve(r);
    } );
    return deferred;
  };

  SetModel.destroy = function ( key ) {

    var deferred = this.defer();

    key = this.appendNamespace( key );

    this.client.del( key, function( e, r ) {
      if ( e ) { return deferred.reject( e ); }
      return deferred.resolve( r );
    });

    return deferred;

  };

  return SetModel;
};