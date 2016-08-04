/*
 * This is run: node scrapePilgrimData.js
 * It combines the monthly pilgrim data gotten by scaping one page of the web site
 * into one big file the the server.js program can read in.
 */
 "use strict";

var shared = require('./shared')
var fs = require('fs');
var request = require("request");
var url = "https://oficinadelperegrino.com/en/wp-admin/admin-ajax.php";

function getPage(year, month, whenDone) {
  var outfilename = './data.raw/pdj-' + year + '-' + month + '.json';

  if (fs.existsSync(outfilename)) {
    console.log(`page(${year},${month}) exists`)
    whenDone()
    return
  }

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

var fetchListWithWaits = pairList => {
  if (pairList.length === 0) return
  var p = pairList[0]
  getPage(p[0], p[1], () => {fetchListWithWaits(pairList.slice(1))})
}

var makeYearPairs = (year) => shared.monthsForYear(year).map((month) => [year,month])
var allYears = shared.years.reduce((prev,year) => prev.concat(makeYearPairs(year)), [])
fetchListWithWaits(allYears)
