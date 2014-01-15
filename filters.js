module.exports = {
  ifStrReturnInt : function ( str ) {
    if ( typeof str === 'string' ) {
      str = parseInt( str, 10 );
    }
    return str;
  },
  realBoolNull   : function ( str ) {
    switch ( str ) {
      case "false":
        return false;
      case "true":
        return true;
      case "null":
        return null;
      default:
        return str;
    }
  }
};