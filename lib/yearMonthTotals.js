"use strict";
var pdata = require('../data/allData.json')

const years = ['2015', '2014', '2013', '2012', '2011', '2010','2009', '2008', '2007', '2006', '2005', '2004']

const options = [
  ['', 'field', ['pilgrims'], ['All']],
  ['by-age', 'field', ['under30', 'from30to60', 'over60'], ['< 30', '30-60', '> 60']],
  ['by-month', 'month', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']],
  ['by-gender', 'field', ['women', 'men'], ['Women', 'Men']],
  ['by-country', 'array', 'foreigners'],
  ['by-camino', 'array', 'caminos'],
  ['by-starting-point', 'array', 'startingPlaces'],
  ['by-transport', 'field', ['walking', 'cycling', 'riding', 'wheelchair'],
    ['Walk', 'Bicycle', 'Horse', 'Wheelchair']],
  ['by-reason', 'field', ['religious', 'religiousCultural', 'cultural'], ['Religious', 'Religious/Cultural', 'Cultural']],
  ['by-profession', 'array', 'professions'],
  ['spanish-by-region', 'array', 'spanishFrom'],
  ['', 'field', ['spanishTotal'], []],
]

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var yearlyTotalsCalculated = false
var totalYearlyData = () => {
  // Only do this once
  if (yearlyTotalsCalculated) return

  yearlyTotalsCalculated = true
  years.forEach((year) => {
    ['pilgrims','spanishTotal'].forEach((f) => { pdata[year]['all'][f] = 0 })
    options.forEach((option) => {
      if (option[1]==='field') {
        option[2].forEach((optionField) => {pdata[year]['all'][optionField] = 0})
      } else if (option[1]==='array') {
        pdata[year]['all'][option[2]] = []
      }
    })
  })
  years.forEach((year) => {
    options[2][2].forEach((month) => {
      ['pilgrims','spanishTotal'].forEach((f) => {
        pdata[year]['all'][f] += parseInt(pdata[year][month][f],10)
      })
      options.forEach((option) => {
        if (option[1]==='field') {
          option[2].forEach((optionField) => {
            pdata[year]['all'][optionField] += parseInt(pdata[year][month][optionField],10)
          })
        } else if (option[1]==='array') {
          var yearlyArray = pdata[year]['all'][option[2]]
          var monthlyArray =  pdata[year][month][option[2]]
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
        }
      })
    })
  })
}


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var  combinedLabels = (fieldName) => {
  var ret = []
  years.forEach((year) => {
    pdata[year]['all'][fieldName].forEach((pair) => {
      if (ret.indexOf(pair[0]) < 0) ret.push(pair[0])
    })
  })
  return ret
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var yearMonthTotals = (params) => {

  totalYearlyData()

  var currentOption = null
  options.forEach((option) => {
    if (params[0] === option[0]) {
      currentOption = option
    }
  })
  if (!currentOption) {
    console.log('no option match for ' + params[0])
    currentOption = options[1]
  }

  //------------------------------------------------------------------------------
  //------------------------------------------------------------------------------
  var html = `<div class="table-responsive results-div">
  <table class="table table-bordered table-striped">
  <tr><th>Year</th><th>All</th>`
  var labels = []
  if (currentOption[1] === 'field') {
    labels = currentOption[3]
  } else if (currentOption[1] === 'array') {
    labels = combinedLabels(currentOption[2])
  }
  labels.forEach((label) => { html += `<th>${label}</th>` })
  html += '</tr>'

  years.forEach((year) => {
    html += `<tr><td>${year}</td>`
    var yearTotal = pdata[year]['all'].pilgrims
    html += `<td>${numberWithCommas(yearTotal)}</td>`
    var array = []
    if (currentOption[1] === 'field') {
      array = currentOption[3]
    } else if (currentOption[1] === 'array') {
      array = labels
    }
    array.forEach((label, labelIndex) => {
      var optionField = currentOption[2][labelIndex]
      var optionValue = 9999
      if (currentOption[1] === 'field') {
        optionValue = pdata[year]['all'][optionField]
      } else if (currentOption[1] === 'month') {
        optionValue = pdata[year][optionField]['pilgrims']
      } else if (currentOption[1] === 'array') {
        var indexOfLabel = labels.indexOf(label)
        console.log(`indexOfLabel=${indexOfLabel}`, currentOption[2])
        console.log(pdata[year]['all'][currentOption[2]])
        optionValue = pdata[year]['all'][currentOption[2]][indexOfLabel][1]
      }
      html += `<td>${numberWithCommas(optionValue)}<br/>
      ${(100*optionValue/yearTotal).toFixed(0)}%</td>`
    })
  })
  html += '</tr>'

  html += '</table></div>';
  return html
};
module.exports = yearMonthTotals
