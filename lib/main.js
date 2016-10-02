"use strict";
//console.log('PROCESS main.js')

var recomputePane = require('./recomputePane.js')
var globals = require('./globals.js')
var _ = require('lodash')

//------------------------------------------------------------------------------
// Run when the document is ready
//------------------------------------------------------------------------------
var docReady = function() {
  google.charts.load('current', {'packages':['corechart', 'table', 'line', 'bar']});
  google.charts.load('upcoming', {'packages': ['geochart']});

  globals.mainContent = $('.main-content')
  var panel = $('<div class="form-div"></div>')
  globals.mainSelect = globals.makeSelect('by-what', '', '', [
    {label:'About this site', value:'about', selected:true},
    {label:'Month they completed the Camino', value:'by-month', selected:false},
    {label:'Age of pilgrims', value:'by-age', selected:false},
    {label:'Age by month completed', value:'by-age-month', selected:false},
    {label:'Gender of pilgrims', value:'by-gender', selected:false},
    {label:'Which Camino they traveled', value:'by-camino', selected:false},
    {label:'Country of origin', value:'by-country', selected:false},
    {label:'Where they started by city', value:'by-starting-city', selected:false},
    {label:'Where they started by province or country', value:'by-starting-region', selected:false},
    {label:'Method of travel', value:'by-transport', selected:false},
    {label:'Reason for pilgrimage', value:'by-reason', selected:false},
    {label:'Profession of pilgrims', value:'by-profession', selected:false},
    {label:'Spanish pilgrims by region of residence', value:'spanish-by-region', selected:false},
  ]).on('change', recomputePane)
  $('.main-header').append(globals.mainSelect)
  globals.mainContent.append(panel)
  recomputePane()
}

$(docReady);
