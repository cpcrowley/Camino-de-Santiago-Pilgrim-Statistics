"use strict";
var pdata = require('../data/allData.json')
const shared = require('./shared')

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var addIfUniqueIn = (x,arr) => {if (arr.indexOf(x) < 0) arr.push(x)}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var  combinedLabels = (fieldName) => {
  var ret = []
  shared.years.forEach((year) => {
    pdata[year]['all'][fieldName].forEach((pair) => {addIfUniqueIn(pair[0], ret)})
  })
  return ret
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var totals = (params) => {

  var currentOption = shared.options.find((option) => {if (params[0] === option.tag) return option})
  if (!currentOption) {
    console.log('no option match for ' + params[0])
    currentOption = shared.options[0]
  }

  //------------------------------------------------------------------------------
  //------------------------------------------------------------------------------
  var html = `<div class="table-responsive results-div">
  <table class="table table-bordered table-striped">
  <tr><th>Year</th><th>All</th>`

  var labels = []
  switch (currentOption.type) {
    case 'field':
    labels = currentOption.labels
    break;

    case 'array':
    labels = combinedLabels(currentOption.field)
    break;

    case 'months':
    labels = shared.months
    break;

  }

  labels.forEach((label) => { html += `<th>${label}</th>` })
  html += '</tr>'

  shared.years.forEach((year) => {
    html += `<tr><td>${year}</td>`
    var yearTotal = pdata[year]['all'].pilgrims
    html += `<td>${numberWithCommas(yearTotal)}</td>`
    var array = []
    if (currentOption.type === 'field') {
      array = currentOption.keys
    } else if (currentOption.type === 'array') {
      array = labels
    }
    array.forEach((key) => {
      var keyValue = 9999
      if (currentOption.type === 'field') {
        keyValue = pdata[year]['all'][key]
      } else if (currentOption.type === 'month') {
        keyValue = pdata[year][key]['pilgrims']
      } else if (currentOption.type === 'array') {
        var indexOfLabel = labels.indexOf(label)
        //console.log(`indexOfLabel=${indexOfLabel}`, currentOption.field)
        //console.log(pdata[year]['all'][currentOption.field])
        keyValue = pdata[year]['all'][currentOption.field][indexOfLabel][1]
      }
      html += `<td>${numberWithCommas(keyValue)}<br/>${(100*keyValue/yearTotal).toFixed(0)}%</td>`
    })
  })
  html += '</tr>'

  html += '</table></div>';
  return html
};
module.exports = totals
