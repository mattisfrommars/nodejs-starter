var Model = require( './model' );


module.exports = function keyModelFactory( namespace ) {
  var KeyModel = Model.factory();
  namespace = namespace || false;
  KeyModel.namespace = namespace;

  KeyModel.get = function ( key ) {

    key = this.appendNamespace( key );

    var deferred = this.defer();

    this.client.get( key, function ( e, r ) {
      if ( e ) {
        return deferred.reject( e );
      }
      return deferred.resolve( r );
    } );

    return deferred;

  };

  KeyModel.set = function ( key, val ) {
    key = this.appendNamespace( key );
    var deferred = this.defer();

    this.client.set( key, val, function ( e, r ) {
      if ( e ) {
        return deferred.reject( e );
      }
      return deferred.resolve( r );
    } );

    return deferred;
  };

  return KeyModel;
};