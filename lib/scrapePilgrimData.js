/*
 * This is run: node scrapePilgrimData.js
 * It combines the monthly pilgrim data gotten by scaping one page of the web site
 * into one big file the the server.js program can read in.
 */
 "use strict";

var fs = require('fs');
var request = require("request");
var cheerio = require("cheerio");
var urlPrefix = "http://peregrinossantiago.es/en/pilgrims-office/statistics/?anio=";

function getWord(n, textLine) {
  var words = textLine.split(' ');
  if (n >= words.length) {
    console.log('ERROR: getWord, n='+n+', line='+textLine);
    return 'ERROR';
  }
  return words[n].replace('.', '');
}

function processPageData(year, month, lines, allData) {
  allData.year = year
  allData.month = month
  var line0 = lines[0];
  var wordsInLine = line0.split(' ');
  var keyword = wordsInLine[0];
  var words;
  var lines2;
  var retArray;
  switch (keyword) {
    case 'Durante':
    allData.pilgrims = getWord(1, lines[1])
    allData.women = getWord(0, lines[3])
    allData.men = getWord(0, lines[4])
    allData.walking = getWord(4, lines[5])
    allData.cycling = getWord(2, lines[6])
    allData.riding = getWord(2, lines[7])
    allData.wheelchair = getWord(1, lines[8])
    break;

    case 'Edad':
    allData.under30 = getWord(5, lines[1])
    allData.from30to60 = getWord(6, lines[3])
    allData.over60 = getWord(5, lines[5])
    break;

    case 'Motivación':
    allData.religious = getWord(1, lines[1])
    allData.religiousCultural = getWord(1, lines[2])
    allData.cultural = getWord(2, lines[3])
    break;

    case 'Nacionalidades':
    allData.spanishTotal = getWord(1, lines[1])
    lines2 = lines[3].split('; ')
    var spanishArray = [];
    lines2.forEach(function(v) {
      var words = v.split(', con ')
      if (words.length > 1) {
        var number = words[1].split(' ')[0].replace('.', '')
        spanishArray.push([words[0], number])
      }
    })
    allData.spanishFrom = spanishArray
    break;

    case 'Extranjeros:':
    lines2 = lines[2].split('; ')
    var foreignersArray = [];
    lines2.forEach(function(v) {
      var words = v.split(', con ')
      if (words.length > 1) {
        var number = words[1].split(' ')[0].replace('.', '')
        foreignersArray.push([words[0], number])
      }
    })
    allData.foreigners = foreignersArray
    break;

    case 'Profesiones':
    var professionsArray = [];
    lines.forEach(function(line) {
      var words = line.split(' con ')
      if (words.length > 1) {
        var number = words[1].split(' ')[0].replace('.', '')
        professionsArray.push([words[0], number])
      }
    })
    allData.professions = professionsArray
    break;

    case 'Lugar':
    var startPlaceArray = [];
    lines.forEach(function(line) {
      var words = line.split(' con ')
      if (words.length > 1) {
        var number = words[1].split(' ')[0].replace('.', '')
        startPlaceArray.push([words[0], number])
      }
    })
    allData.startingPlaces = startPlaceArray
    break;

    case 'Camino':
    var caminoArray = [];
    lines.forEach(function(line) {
      var words = line.split(' con ')
      if (words.length > 1) {
        var camino = words[0].replace(' de', '')
        var number = words[1].split(' ')[0].replace('.', '')
        caminoArray.push([words[0], number])
      }
    })
    allData.caminos = caminoArray
    break;

    default:
    console.log('*********** ERROR: Unknown keyword ' + keyword)
    console.log(lines);
    break;

  }
}

function getPage(year, month) {
  var callTime = new Date().getTime();
  console.log('getPage(' + year + ', ' + month + ')')

  var url = urlPrefix + year + '&mes=' + month;

  request(url, function (error, response, body) {
    if (error) {
      console.log("*** ERROR fetching url: " + url + ', error=' + error);
      console.log(error);
      return;
    }

    var ms = new Date().getTime() - callTime;
    console.log(`read page for ${year}-${month ? month : 'all'} in ${ms}ms`);
    console.log(`url=${url}`)
    var $ = cheerio.load(body);
    var allData = {}

    $('div p').each(function(i, element){
      var lines = $(this).text().split('\n')
      .filter(function(v){return v!='';})
      .map(function(v) { return v.trim(); })

      processPageData(year, month, lines, allData);
    })

    var filename = './data/pd-' + year + '-' + (month ? month : 'all') + '.json';
    fs.writeFile(filename, JSON.stringify(allData, null, 2), function(error) {
      if (error) {
        console.error("write error:  " + error.message);
      } else {
        console.log("Wrote file " + filename);
      }
    });
  })
}

getPage('2016', '7')
//getPage('2016', '5')

/*
var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '']
months.slice(0,5).forEach(function(month) {
  getPage('2016', month);
})
var years = ['2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004']
years.forEach(function(year) {
  months.forEach(function(month) {
    getPage(year, month);
  })
})*/
