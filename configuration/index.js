var nconf = require( 'nconf' );

var Config = function ConfigConstructor() {
  nconf.argv().env( '_' );
  var environment = nconf.get( 'NODE:ENV' ) || 'development';
  nconf.file( environment, absPath('/config/' + environment + '.json') );
  nconf.file( 'routes', absPath('/config/routes.json') );
  nconf.file( 'default', absPath('/config/default.json') );
};

/**
 * Returns a config value at a specific key,
 *
 * e.g. config.get("port") will return a value from the JSON file with the same key
 *
 * @param  {String} key
 * @return {String}
 */
Config.prototype.get = function ( key ) {
  return nconf.get( key );
};

module.exports = new Config();