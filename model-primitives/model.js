var all = require( 'node-promise' ).allOrNone;
var changeCase = require( 'change-case' );
var filters = require('cs-utils/filters' );
var hash = require('cs-utils/hash' );
var REQUIRED_PROPERTY = require('cs-utils/strings/errors' ).REQUIRED_PROPERTY;
var EXPECTING_FUNCTION = require('cs-utils/strings/errors' ).EXPECTING_PARAM_TYPE.replace( /_TYPE_/, 'function');
var client = require('cs-utils/configuration/redis' );
var jqd = require('JQDeferred');

var Model = function () {
  this.client = client;
};

Model.prototype.hash = hash;

Model.prototype.requiredParams = [];
Model.prototype.validations = {};
Model.prototype.validationsAsync = {};

Model.prototype.parseMap = {};

Model.prototype.filters = filters;

Model.prototype.appendNamespace = function ( key ) {
  if ( !this.namespace ) {
    return key;
  } else {
    return [this.namespace, key].join( ':' );
  }
};

Model.prototype.defer = function() {
  return new jqd();
}

Model.prototype.linkedModelMethodName = function ( linkedModel ) {
  var prefix = 'link';
  var pascalCase = changeCase.pascalCase( linkedModel );
  return prefix + pascalCase;
};

Model.prototype.validateCreate = function ( q, params ) {
  try {
    var didPreCreateHook = this.defer();
    this.requiredParamsCheck( params ); // synchronous, handle with try catch
    this.validationsCheck( params );    // synchronous, handle with try catch
    this.validationsCheckAsync( didPreCreateHook, params )
    .then( q.resolve, q.reject );
  } catch ( e ) {
    q.reject(e);
  }
  return q;
};

Model.prototype.requiredParamsCheck = function ( params ) {
  this.requiredParams.forEach(function( requiredParam ){
    if ( params.hasOwnProperty( requiredParam ) === false ) {
      throw { code : 400, message: REQUIRED_PROPERTY.replace( '_PROP_', requiredParam ) };
    }
  });
};

Model.prototype.RegexCheck = function RegExpFilter ( reg ) {
  this.execute = function( value ) {
    if ( reg.test( value ) === false ) {
      return value+" did not match pattern";
    }
  };
};

Model.prototype.validationsCheck = function ( params ) {
  var validation;
  for ( var i = 0, l = this.validations.length; i < l; i++ ) {
    validation = this.validations[ i ];
    var propertyName = validation[ 0 ];
    var filter       = validation[ 1 ];
    var value        = params[ propertyName ];

    if ( filter instanceof RegExp ) {
      var regexFilter = new this.RegexCheck( filter );
      filter = regexFilter.execute;
    }

    var errorMessage = filter( value );
    if ( errorMessage ) { throw errorMessage; }
  }
};

Model.prototype.validationsCheckAsync = function ( q, params ) {
  var self = this;
  var promises = [];
  var validation;
  for ( var i = 0, l = this.validationsAsync.length; i < l; i++ ) {
    validation = this.validationsAsync[ i ];
    var isValid      = self.defer();
    var propertyName = validation[ 0 ];
    var filter       = validation[ 1 ];
    var value        = params[ propertyName ];

    promises.push( isValid.promise() );

    if ( typeof filter !== 'function' ) {
      isValid.reject( EXPECTING_FUNCTION );
      break;
    }

    filter( isValid, value );

  }
  jqd.when.apply( jqd, promises )
    .then( q.resolve, q.reject );
  return q;
};

module.exports = {
  factory : function () {
    return new Model();
  }
};