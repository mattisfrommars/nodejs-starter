var config = require( '../configuration' );
var Redis = require( 'redis' );

var clone = function () {
  var redis = Redis.createClient();
  redis.select( config.get( 'redis:db' ) );
  redis.clone = clone; // whoah
  return redis;
}

module.exports = clone();