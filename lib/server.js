"use strict";

const PORT = 3867;
var http = require('http');

var notes = require('./notes')
var about = require('./about')
var yearMonthTotals = require('./yearMonthTotals')

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
function handleRequest(request, response){
  var ret = ''
  var url = request.url
  var args = []

  var firstqm = url.indexOf('?')
  if (firstqm > 0) {
    url = request.url.substring(0, firstqm)
    var argParts = request.url.substring(firstqm+1).split('&')
    argParts.forEach(function(argPart) {
      args.push(argPart.split('=')[1])
    })
  }

  var okHTMLHeaders = {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'}
  switch (url) {

    case '/yearMonthTotals':
    ret = yearMonthTotals(args)
    response.writeHead(200, okHTMLHeaders);
    break

    case '/about':
    ret = about()
    response.writeHead(200, okHTMLHeaders);
    break

    case '/notes':
    ret = notes()
    response.writeHead(200, okHTMLHeaders);
    break

    case '/favicon.ico':
    ret = '<h1>IGNORING /favicon.ico</h1>'
    response.writeHead(200, okHTMLHeaders);
    break

    default:
    ret = '<h1>ERROR: Unknown path "' + request.url + '"</h1>'
    console.log('ERROR path: ' + request.url)
    response.writeHead(404, okHTMLHeaders);
    break;
  }
  response.end(ret)
}

var server = http.createServer(handleRequest);
server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
