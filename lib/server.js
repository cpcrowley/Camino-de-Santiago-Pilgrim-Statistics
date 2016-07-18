"use strict";

var http = require('http');
const PORT = 3856;

var notes = require('./notes')
var about = require('./about')
var finalJeopardy = require('./finalJeopardy')
var findInClues = require('./findInClues')
var percentCorrect = require('./percentCorrect')
var createGame = require('./createGame')
var mostCommonCategories = require('./mostCommonCategories')
var winsByPlayer = require('./winsByPlayer')
var analyzePlayers = require('./analyzePlayers')

var Ganswers = []


//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
function handleRequest(request, response){
  var ret = ''
  var url = request.url
  var argParts = []
  var arg0 = null, arg1 = null, arg2 = null, arg3 = null, arg4 = null

  var firstqm = url.indexOf('?')
  if (firstqm > 0) {
    url = request.url.substring(0, firstqm)
    var args = request.url.substring(firstqm+1)
    argParts = args.split('&')
    if (argParts.length > 0) {
      arg0 = argParts[0].split('=')[1]
      if (argParts.length > 1) {
        arg1 = argParts[1].split('=')[1]
        if (argParts.length > 2) {
          arg2 = argParts[2].split('=')[1]
          if (argParts.length > 3) {
            arg3 = argParts[3].split('=')[1]
            if (argParts.length > 4) {
              arg4 = argParts[4].split('=')[1]
            }
          }
        }
      }
    }
  }

  var okHTMLHeaders = {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'}
  switch (url) {

    case '/percentCorrectByPlayer':
    ret = analyzePlayers(resetAnswers, arg0, arg1, arg2)
    response.writeHead(200, okHTMLHeaders);
    break

    case '/percentCorrect':
    resetAnswers()
    ret = percentCorrect(Ganswers, arg0, arg1, arg2, arg3, arg4)
    response.writeHead(200, okHTMLHeaders);
    break

    case '/mostCommonCategories':
    ret = mostCommonCategories(arg0)
    response.writeHead(200, okHTMLHeaders);
    break

    case '/finalJeopardy':
    ret = finalJeopardy()
    response.writeHead(200, okHTMLHeaders);
    break

    case '/findInClues':
    ret = findInClues(arg0)
    response.writeHead(200, okHTMLHeaders);
    break

    case '/winsByPlayer':
    ret = winsByPlayer()
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

//------------------------------------------------------------------------------
// answers is:
// ** An array of 33 seasons [0-32]
// ???? What is season 0 used for?
//
// Each season is
// ** a game which is an array of 4 rounds [0-3]
// ** round[0] is the Jeopardy round
// ** round[1] is the Double Jeopardy round
// ** round[2] is the Jeopardy round for daily doubles
// ** round[3] is the Double Jeopardy round for daily doubles
//
// Each round  is a 5x21 array of 5 rows and 21 columns [0-4, 0-20]
// ** Each entry is a number
// ** the rows are the 5 rows on the Jeopardy board
//
// First we'll explain the use of the first 7 columns.
// The columns are accumulators for the 7 possible right/wrong totals
// ** [0]: 0 right/0 wrong
// ** [1]: 0 right/1 wrong
// ** [2]: 0 right/2 wrong
// ** [3]: 0 right/3 wrong
// ** [4]: 1 right/0 wrong
// ** [5]: 1 right/1 wrong
// ** [6]: 1 right/2 wrong
// When the analysis is for a single player only two of these are used
// ** [0]: player answered wrong
// ** [4]: player answered right
//
// The next seven columns are the same except for the case of an out-of-order
// clue (one where there is an unasked cell above it).
// The final seven columns for for out-of-order clues which are the first clue
// used in the Jeopardy baord column, a product of hunting for daily doubles.
//------------------------------------------------------------------------------
var resetAnswers = function() {
    for(var season=0; season<=33; ++season) Ganswers[season] = createGame(4);
    return Ganswers
};
