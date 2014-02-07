var jqd = require('JQDeferred');
var Model = require( './model' );
var PARAM_NOT_IMPLEMENTED = require('cs-utils/strings/errors' ).PARAM_NOT_IMPLEMENTED;
var MISSING_MODEL = require('cs-utils/strings/errors' ).MISSING_MODEL.replace( /_MODEL_/, 'Model' );


module.exports = function hashModelFactory( namespace ) {

  var HashModel = Model.factory();

  HashModel.namespace = namespace || false;

  HashModel.exists = function ( key ) {

    var deferred = this.defer();

    key = this.appendNamespace( key );

    this.client.hlen( key, function ( e, r ) {
      if ( e ) {
        return deferred.reject( e );
      }
      return deferred.resolve( r > 0 );
    } );

    return deferred;

  };

  HashModel.find = function ( id ) {
    var self = this;

    var deferred = this.defer();
    var key = this.appendNamespace( id );

    this.client.hgetall( key, function ( e, r ) {
      if ( e ) {
        return deferred.reject( e );
      }
      r = self.parse( r );
      return deferred.resolve( r );
    } );

    return deferred;

  };

  HashModel.parse = function ( model ) {
    var filter;
    for ( var i in model ) {
      if ( !model.hasOwnProperty( i ) ) {
        continue;
      }
      if ( this.parseMap.hasOwnProperty( i ) ) {
        filter = this.parseMap[i];
        model[i] = filter( model[i] );
      }
    }
    return model;
  };

  HashModel.findWith = function ( id, withList, strict ) {

    // In strict mode, model must exist to continue
    if ( typeof strict === 'undefined' ) {
      strict = true;
    }

    var model = {};

    if ( !withList ) {
      withList = [];
    }

    var self = this;
    var gotInitialModel = this.defer();
    var gotEverything = this.defer();
    var promises = [ gotInitialModel.promise() ];

    this.find( id ).then( function ( r ) {
      if ( !r ) {
        if ( !strict ) {
          return gotEverything.resolve( r );
        }
        return gotEverything.reject( {code : 404, message : MISSING_MODEL.replace( /_ID_/, id )} );
      }
      gotInitialModel.resolve();
      model = r;
      withList.forEach( function ( linkedModel ) {
        var deferred = self.defer();
        promises.push( deferred.promise() );
        if ( typeof linkedModel !== 'string' ) {
          return deferred.reject( 'PARAM: ' + JSON.stringify( linkedModel ) + ' is not a string' );
        }
        var methodName = self.linkedModelMethodName( linkedModel );
        if ( typeof self[ methodName ] !== 'function' ) {
          return deferred.reject( PARAM_NOT_IMPLEMENTED.replace( /_PARAM_/, methodName ) );
        }
        self[ methodName ]( model ).then( function ( linkedData ) {
          model[ linkedModel ] = linkedData;
          deferred.resolve();
        }, function ( e ) {
          deferred.reject( e );
        } );
      } );

      jqd.when.apply( jqd, promises ).then(
        function () {
          gotEverything.resolve( model );
        },
        gotEverything.reject
      );

    } );

    return gotEverything;

  };

  HashModel.findAll = function ( ids, linkedModels ) {
    if ( !linkedModels ) {
      linkedModels = [];
    }
    var results = [];
    var self = this;
    var gotEverything = this.defer();
    var promises = [];


    ids.forEach( function ( id ) {
      var deferred = self.defer();
      promises.push( deferred.promise() );
      self.findWith( id, linkedModels ).then(
        function ( r ) {
          results.push( r );
          deferred.resolve();
        },
        deferred.reject
      );
    } );

    jqd.when.apply( jqd, promises ).then(
      function () {
        gotEverything.resolve( results );
      },
      gotEverything.reject
    );
    return gotEverything;
  };

  HashModel.set = function ( key, vals ) {
    var deferred = this.defer();

    key = this.appendNamespace( key );
    this.client.hmset( key, vals, function ( e ) {
      if ( e ) {
        return deferred.reject( e );
      }
      return deferred.resolve( vals );
    } );

    return deferred;
  };

  HashModel.create = function ( key, vals ) {
    var self = this;
    var didSet = this.defer();
    var didValidate = this.defer();
    this.validateCreate( didValidate, vals )
    .then(function(){
      return self.set( key, vals );
    }, didSet.reject)
    .then(function(r){
      didSet.resolve( r );
      self.postCreate( r );
    }, didSet.reject );
    return didSet;
  };

  HashModel.postCreate = function () {
  }; // placeholder

  HashModel.update = function ( key, vals ) {
    var self = this;
    var didSet = this.defer();
    this.set( key, vals ).then( function ( r ) {
      self.find( key )
      .then( function( thisModel ){
        self.postUpdate.call( self, thisModel );
        didSet.resolve( thisModel );
      }, didSet.reject );
    }, didSet.reject );
    return didSet;
  };

  HashModel.postUpdate = function ( thisModel ) {
  };

  HashModel.destroy = function ( key ) {

    var self = this;
    var deferred = this.defer();

    key = this.appendNamespace( key );

    this.client.del( key, function ( e, r ) {
      if ( e ) {
        return deferred.reject( e );
      }
      self.postDestroy();
      return deferred.resolve( r );
    } );

    return deferred;

  };

  HashModel.postDestroy = function () {
  };

  HashModel.createIfNotExists = function ( key, vals ) {

    var that = this;

    var deferred = that.defer();

    that.exists( key ).then(
      function ( r ) {
        if ( r ) {
          return deferred.reject( {code : 400, message : 'Model exists at key: ' + that.appendNamespace( key )} );
        }
        that.create( key, vals ).then(
          function ( r ) {
            deferred.resolve( r );
          },
          function ( e ) {
            return deferred.reject( e );
          }
        );

      },
      function ( e ) {
        return deferred.reject( e );
      }
    );

    return deferred;

  };

  HashModel.updateIfExists = function ( key, vals ) {

    var that = this;

    var deferred = that.defer();

    // @TODO: refactor this to chop down christmas trees
    that.exists( key ).then(
      function ( r ) {
        if ( !r ) {
          return deferred.reject( {code : 404, message : 'Model does not exist at key: ' + that.appendNamespace( key )} );
        }

        that.update( key, vals ).then(
          deferred.resolve, deferred.reject
        );
      },
      function ( e ) {
        return deferred.reject( e );
      }
    );

    return deferred;

  };

  return HashModel;
};