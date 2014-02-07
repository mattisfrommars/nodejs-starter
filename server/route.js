var defer = require( 'node-promise' ).defer;
var changeCase = require( 'change-case' );
var UNEXPECTED_ERROR = require('../strings/errors' ).UNEXPECTED;

var Route = function ( routeConfig ) {
  this.verb = routeConfig[ 0 ];
  this.url = routeConfig[ 1 ];
  this.controller = rqr( this.controllerName( routeConfig[ 2 ] ) );

  this.method = routeConfig[ 3 ];
  this.middlewares = routeConfig[ 4 ];
};

Route.prototype.attach = function ( app ) {
  this.loadMiddlewares();
  app[ this.verb ](
    this.url,
    this.middlewares,
    this.perform.bind( this )
  );
};

Route.prototype.loadMiddlewares = function () {
  var self = this;
  this.middlewares = this.middlewares.map( function ( middleware ) {
    if ( typeof middleware === 'string' ) {
      return rqr( self.middlewareName( middleware ) );
    }
    return middleware;
  } );
};

Route.prototype.middlewareName = function ( middleware ) {
  return 'middleware/' + changeCase.camelCase( middleware );
};

Route.prototype.controllerName = function ( controller ) {
  return 'controllers/' + changeCase.camelCase( controller );
};

Route.prototype.extractResponse = function ( response, defaultCode, defaultMessage ) {
  response = response || '';
  defaultCode = defaultCode || 200;
  defaultMessage = defaultMessage || response;
  var code;
  var message;

  if ( typeof response === 'string' ) {
    message = response;
  } else {
    code = response.code || defaultCode;
    if ( response.message ) { message = response.message; }
    if ( response.res )     { message = response.res; }
  }
  if (!message) { message = defaultMessage; }
  if (!code)    { code    = defaultCode; }
  return {
    code : code,
    message : message
  }
}

Route.prototype.perform = function ( req, res ) {
  var self = this;
  var q = defer();

  this.controller[ this.method ]( q, req );
  q.then( function ( response ) {
    var extractedResponse = self.extractResponse( response );
    res.json( extractedResponse.code, extractedResponse.message );
  }, function ( e ) {
    var extractedResponse = self.extractResponse( e, 500, UNEXPECTED_ERROR );
    res.json( extractedResponse.code, extractedResponse );
  } );
};

module.exports = Route;