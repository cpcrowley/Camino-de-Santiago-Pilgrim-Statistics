/*
 * This is run: node combineYears.js
 * It combines the monthly pilgrim data gotten by scaping one page of the web site
 * into one big file the the server.js program can read in.
 */
 "use strict";

const fs = require('fs')
const shared = require('./shared')

var pData = {}
shared.years.forEach(function(year) {pData[year]={}})
var numStarted = 0
var numFinished = 0

var writeData = () => {
  console.log('Write ./data/pData.json');
  fs.writeFile('./data/pData.json', JSON.stringify(pData, null, 0))

  console.log('Write ./data/pDataHuman.json');
  fs.writeFile('./data/pDataHuman.json', JSON.stringify(pData, null, 2))

  console.log('Write ./data/pData2015Human.json');
  fs.writeFile('./data/pData2015Human.json', JSON.stringify(pData['2015'], null, 2))

  var pDataByYear = {}
  shared.years.forEach((year) => { pDataByYear[year] = pData[year]['all'] })

  console.log('Write ./data/pDataByYearHuman.json');
  fs.writeFile('./data/pDataByYearHuman.json', JSON.stringify(pDataByYear, null, 2))
}

var processData = () => {
  shared.years.forEach((year) => {
    ['pilgrims','spanishTotal'].forEach((f) => { pData[year]['all'][f] = 0 })
    shared.options.forEach((option) => {
      if (option.type==='field') {
        option.keys.forEach((optionField) => {pData[year]['all'][optionField] = 0})
      } else if (option.type==='array') {
        pData[year]['all'][option.field] = []
      }
    })
  })

  shared.years.forEach((year) => {
    shared.months.concat('all').forEach((month) => {
      ['pilgrims','spanishTotal'].forEach((f) => {
        pData[year]['all'][f] += parseInt(pData[year][month][f],10)
      })
      shared.options.forEach((option) => {
        switch (option.type) {
          case 'field':
          option.keys.forEach((optionField) => {
            pData[year]['all'][optionField] += parseInt(pData[year][month][optionField],10)
          })
          break;

          case 'array':
          var yearlyArray = pData[year]['all'][option.field]
          var monthlyArray =  pData[year][month][option.field]
          monthlyArray.forEach((nameValuePair) => {
            var name = nameValuePair[0]
            var value = parseInt(nameValuePair[1],10)
            var currentYearlyEntry = yearlyArray.find((pair) => {
              if (pair[0] === name) return pair;
            })
            if (currentYearlyEntry) {
              currentYearlyEntry[1] += value
            } else {
              yearlyArray.push([name, value])
            }
          })
          break;
        }
      })
    })
  })
}

var readMonthlyData = () => {
  shared.years.forEach((year) => {
    shared.months.concat('all').forEach(function(month) {
      let filename = './data/pd-' + year + '-' + month + '.json';
      ++numStarted
      fs.readFile(filename, (err, dataIn) => {
        if (err) {
          console.log('***** ERROR reading ' + filename)
        } else {
          pData[year][month] = JSON.parse(dataIn);
          ++numFinished
          if (numStarted === numFinished) {
            // Do not do this for now.
            // It appears to have been done in the "all versions already.
            //processData()
            writeData();
          }
        }
      })
    })
  })
}

readMonthlyData()
