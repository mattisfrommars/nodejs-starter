var nconf = require( 'nconf' );

var Config = function ConfigConstructor() {
  nconf.argv().env( '_' );
  var environment = nconf.get( 'NODE:ENV' ) || 'development';
  nconf.file( environment, absPath('/config/' + environment + '.json') );
  nconf.file( 'routes', absPath('/config/routes.json') );
  nconf.file( 'default', absPath('/config/default.json') );
};

Config.prototype.get = function ( key ) {
  return nconf.get( key );
};

module.exports = new Config();