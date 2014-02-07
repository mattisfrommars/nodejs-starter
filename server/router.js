var Route = require( './route' );

module.exports.attachRoutes = function ( app, routes ) {
  var route;
  routes.forEach( function ( thisRoute ) {
    route = new Route( thisRoute );
    route.attach( app );
  } );
};

