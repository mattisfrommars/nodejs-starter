nodejs-starter
==============

Modules I use to create Node.js Projects


Setup:
------

In the main `src/` or `lib/` (or wherever) folder, define these global functions to enable module loading

````javascript
global.baseDir = __dirname;
global.absPath = function ( path ) {
  return baseDir + path;
};

global.rqr = function ( file ) {
  return require( absPath( '/' + file ) );
};
````


To Use:
-------
add to your package.json and npm install
````javascript
{
  "dependencies": {
    "utils": "git+ssh://git@github.com:mattisfrommars/nodejs-starter.git"
  }
}
    
````

Modules:
--------

#### Configuration

In your source folder (where you defined the global.absPath function above), create a `config` folder. The config file will load from json files with the following names `config/default.json`, `config/routes.json` and `config/ENVIRONMENT.json` where ENVIRONMNENT is the NODE:ENV. Defaults to 'development'.

##### config/development.json
````json
{
  "port" : 9000
}
````
##### config/production.json
````json
{
  "port" : 80
}
````
##### app.js
````javascript
var express = require("express");
var app = express();
var config = require("utils/configuration");

app.listen( config.get("port") );
console.log( "Application now listening on port: "+config.get("port") );
````

#### Routing

In your source folder (where you defined the global.absPath function above) create a `controllers` folder and a `middleware` folder.

##### config/routes.json
````json
{
  "routes" : [
    [ "get", "/me", "user", "getUser", ["has_api_key"] ],
    [ "METHOD", "/URI", "CONTROLLER NAME", "METHOD NAME", ["MIDDLEWARE"...] ]
  ]
}
````

##### app.js
````javascript
var express = require("express");
var app = express();
var config = require("utils/configuration");
var router = require("utils/server/router");

var routes = config.get("routes");

router.attachRoutes( app, routes ); 

app.listen( config.get("port") );
console.log( "Application now listening on port: "+config.get("port") );
````

##### middleware/hasApiKey.js
###### (n.b. middleware defined in routes.json in `snake_case`, and filename is `camelCase`  )
````javascript
module.exports = function( req, res, next ){
  // standard express middleware, receives the request, response and next objects
  if ( res.headers.headers.access_token && req.headers.user_id ) {
    // find the user
    req.user = { name : "Mister User" };
    next();
  } else {
    res.json( 401, { "message" : "UNAUTHORIZED" } );
  }
};
````

##### controllers/user.js
````javascript
module.exports = {
  getUser : function ( q, req ) {
    // receives a deferred object, example responses below:
    q.resolve( req.user ); // sends user object attached to req in middleware
    q.resolve( 201, { name : "new object" } ); // sends response with 201 status
    q.reject("wrong"); // sends 500 repsponse
    q.reject( 401, "Unauthorized" ); // sends a 401 response
  }
}
````
