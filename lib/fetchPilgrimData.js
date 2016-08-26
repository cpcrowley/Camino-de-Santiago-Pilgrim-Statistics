/*
 * this node program fetches JSON data from the Camino Pilgrim's Office web site.
 * RUN: node fetchPilgrimData.js
 */
 "use strict";

var shared = require('./shared')
var fs = require('fs');
var request = require("request");
var url = "https://oficinadelperegrino.com/en/wp-admin/admin-ajax.php";

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
function getPage(year, month, whenDone) {
  var outfilename = './data.raw/pdj-' + year + '-' + month + '.json';

  //----------------------------------------------------------------------------
  // If the file already exists then do not fetch it.
  //----------------------------------------------------------------------------
  if (fs.existsSync(outfilename)) {
    console.log(`${outfilename} exists`)
    whenDone()
    return
  }

  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------
  var callTime = new Date().getTime();
  console.log(`getPage(${year},${month}) from ${outfilename}`)

  var options = {
    url: url,
    form: {
      ultimo_anno_santo: '2010',
      anno: year,
      mes: month,
      action: 'compostelana_get_estadisticas'
    }
  }

  //----------------------------------------------------------------------------
  // Send an HTTP POST request to get the JSON data file.
  //----------------------------------------------------------------------------
  request.post(options, function (error, response, body) {
    whenDone()
    if (error) {
      console.log("*** ERROR fetching url: " + url + ', error=' + error);
      console.log(error);
      return;
    }

    var ms = new Date().getTime() - callTime;
    console.log(`read data for ${year}-${month} in ${ms}ms`);
    var jsonObject = JSON.parse(body);
    var json = JSON.stringify(jsonObject, null, 2)

    fs.writeFile(outfilename, json, function(error) {
      if (error) {
        console.error("write error:  " + error.message + ', filename=' + outfilename);
      } else {
        console.log("Wrote file " + outfilename);
      }
    });
  })
}

//------------------------------------------------------------------------------
// Fetch the first item of a [year.month] pair. When it completes, move
// on to the next pair.
//------------------------------------------------------------------------------
var fetchListWithWaits = function(pairList) {
  if (pairList.length === 0) return
  var p = pairList[0]
  getPage(p[0], p[1], function() {fetchListWithWaits(pairList.slice(1))})
}

//------------------------------------------------------------------------------
// Create a list of [year.month] pairs for all the years.
// Then fetch them all one at a time
//------------------------------------------------------------------------------
var makeYearPairs = function(year) {return shared.monthsForYear(year).map(function(month) {return [year,month]})}
var allYears = shared.years.reduce(function(prev,year) {return prev.concat(makeYearPairs(year))}, [])
fetchListWithWaits(allYears)
