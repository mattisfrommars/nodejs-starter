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
