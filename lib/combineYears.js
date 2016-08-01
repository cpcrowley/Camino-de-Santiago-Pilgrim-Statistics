/*
 This is run: node combineYears.js
 It combines the monthly pilgrim data gotten by scaping one page of the web site
 into one big file the the server.js program can read in.
 */"use strict";
const fs = require('fs')
const years = ['2015', '2014', '2013', '2012', '2011', '2010','2009',
'2008', '2007', '2006', '2005', '2004']
const months = ['all', '1', '2', '3', '4', '5', '6',
'7', '8', '9', '10', '11', '12']

var allData = {}
years.forEach(function(year) {allData[year]={}})
var numStarted = 0
var numFinished = 0

years.forEach(function(year) {
  months.forEach(function(month) {
    let filename = 'pilgrimData/pd-' + year + '-' + month + '.json';
    //console.log('Start reading ' + filename)
    ++numStarted
    fs.readFile(filename, function(err, data) {
      if (err) {
        console.log('***** ERROR reading ' + filename)
      } else {
        allData[year][month] = JSON.parse(data);
        ++numFinished
        //console.log('Finished reading ' + filename)
        if (numStarted === numFinished) {
          console.log('Writing files ./allData.json and ./allHumanData.json');
          console.log(allData)
          fs.writeFile('./allDataHuman.json', JSON.stringify(allData, null, 2))
          fs.writeFile('./allData.json', JSON.stringify(allData, null, 0))
        }
      }
    })
  })
})
