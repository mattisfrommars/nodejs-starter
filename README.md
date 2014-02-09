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

In your source folder (where you defined the global.absPath function above), create a `config` folder. The config file will load from json files with the following names `config/default.json`, `config.routes.json` and `config/ENVIRONMENT.json` where ENVIRONMNENT is the NODE:ENV. Defaults to 'development'.

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
var express = require('express');
var app = express();
app.listen( config.get("port") );
console.log( "Application now listening on port: "+config.get("port") );
````
