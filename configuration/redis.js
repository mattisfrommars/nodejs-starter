var config = rqr( 'configuration' );
var Redis = require( 'redis' );
var redis = Redis.createClient();
redis.select( config.get( 'redis:db' ) );

module.exports = redis;