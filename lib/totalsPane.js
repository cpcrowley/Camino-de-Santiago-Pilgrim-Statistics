"use strict";
var pdata = require('../data/pData.json')
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

  // NOTE: params[0] if for the debug checkbox, change this is you remove it.

  var currentOption = shared.options.find((option) => {if (params[1] === option.tag) return option})
  if (!currentOption) {
    console.log('no option match for ' + params[1])
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

    case 'month':
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
    } else {
      array = labels
    }
    array.forEach((key) => {
      var keyValue = 9999
      if (currentOption.type === 'field') {
        keyValue = pdata[year]['all'][key]
      } else if (currentOption.type === 'month') {
        keyValue = pdata[year][key]['pilgrims']
      } else if (currentOption.type === 'array') {
        var indexOfLabel = labels.indexOf(key)
        var pair = pdata[year]['all'][currentOption.field][indexOfLabel]
        keyValue = pair ? pair[1] : 0
      }
      html += `<td>${numberWithCommas(keyValue)}<br/>${(100*keyValue/yearTotal).toFixed(0)}%</td>`
    })
  })
  html += '</tr>'

  html += '</table></div>';
  return html
};
module.exports = totals
