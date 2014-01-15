var md5 = require( 'MD5' );

var makeHash = function ( str, hash ) {
  var char;
  for ( var i = 0, l = str.length; i < l; i++ ) {
    char = str.charCodeAt( i );
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash >>> 1; // convert to positive integer
};

module.exports = function ( str ) {
  str = md5( str + 'nullvaluesnotallowed' );
  var hash = 0;
  if ( str.length === 0 ) return hash;
  return makeHash( str, hash );
};