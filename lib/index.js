"use strict";

//------------------------------------------------------------------------------
// Initialization: get data fetch started.
//------------------------------------------------------------------------------
var G = {}
G.pData = null
G.mainContent = null

G.getDataPromise = $.ajax({
  dataType: "json",
  url: './data/pData.json',
})
.done(function(data) {
  G.pData = data
  $('#loading-warning').remove()
  appendTotalsTable('about')
})
.fail(function(prom, status, code) {
  console.log('********* FAILED to fetch pdata '+status+', '+code)
})

// It failed to clear in some cases so add polling
var pollForDataComplete = function() {
  if (G.pData === null) {
    setTimeout(pollForDataComplete, 1000)
  } else {
    $('#loading-warning').remove()
  }
}
pollForDataComplete()

var dropDownMenus = {}
var debugModeCheckbox = null

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeSelect = function(idBase, label, items) {
  var html =
  `<span class="form-label">${label}</span>
  <select name="${idBase}" name="${idBase}" class="${idBase}">`
  items.forEach(function(item) {
    html += `<option ${item.selected?'selected ':''}value="${item.value}">${item.label}</option>`
  })
  html += '</select>'
  return $(html)
};

//------------------------------------------------------------------------------
// Run when the document is ready
//------------------------------------------------------------------------------
var docReady = function() {
  G.mainContent = $('.main-content')
  var panel = $('<div class="form-div"></div>')
  panel.append(makeSelect('by-what', 'Show', [
    {label:'About', value:'about', selected:true},
    {label:'Age of pilgrims', value:'by-age', selected:false},
    {label:'Month they completed the Camino', value:'by-month', selected:false},
    {label:'Gender of pilgrims', value:'by-gender', selected:false},
    {label:'Country of origin', value:'by-country', selected:false},
    {label:'Which Camino they traveled', value:'by-camino', selected:false},
    {label:'Where they started by city', value:'by-starting-city', selected:false},
    {label:'Where they started by province or country', value:'by-starting-region', selected:false},
    {label:'Method of transport', value:'by-transport', selected:false},
    {label:'Reason for pilgrimage', value:'by-reason', selected:false},
    {label:'Profession of pilgrims', value:'by-profession', selected:false},
    {label:'Spanish pilgrims by region of residence', value:'spanish-by-region', selected:false},
  ]).on('change', recomputePane))
  panel.append(makeSelect('max-columns', 'Columns with >= N pilgrims in 2004-2016', [
    {label:'1', value:'1', selected:true},
    {label:'10', value:'10', selected:false},
    {label:'100', value:'100', selected:false},
    {label:'1,000', value:'1000', selected:false},
    {label:'10,000', value:'10000', selected:false},
  ]).on('change', recomputePane))
  G.mainContent.append(panel)
}

$(docReady);

//------------------------------------------------------------------------------
// This recreates a pane to account for changed parameters.
//------------------------------------------------------------------------------
var recomputePane = function() {
  G.mainContent.find('.results-div').remove()

  if (G.pData) {
    var p1 = G.mainContent.find('.by-what').val()
    appendTotalsTable(p1)
  }
}
