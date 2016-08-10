"use strict";

//------------------------------------------------------------------------------
// Initialization: get data fetch started.
//------------------------------------------------------------------------------
var G = {}
G.pData = null
G.mainContent = null
G.mainSelect = null
G.minPilgrimsInCol = 1

G.getDataPromise = $.ajax({
  dataType: "json",
  url: './data/pData.json',
})
.done(function(data) {
  G.pData = data
  $('#loading-warning').remove()
  recomputePane()
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

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeSelect = function(idBase, label, items) {
  var html = ''
  if (label) html += `<span class="form-label">${label}</span>`
  html += `<select name="${idBase}" name="${idBase}" class="${idBase}">`
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
  G.mainSelect = makeSelect('by-what', '', [
    {label:'Welcome', value:'welcome', selected:true},
    {label:'About', value:'about', selected:false},
    {label:'Notes', value:'notes', selected:false},
    {label:'Age of pilgrims', value:'by-age', selected:false},
    {label:'Month they completed the Camino', value:'by-month', selected:false},
    {label:'Gender of pilgrims', value:'by-gender', selected:false},
    {label:'Country of origin', value:'by-country', selected:false},
    {label:'Where they started by city', value:'by-starting-city', selected:false},
    {label:'Where they started by province or country', value:'by-starting-region', selected:false},
    {label:'Which Camino they traveled', value:'by-camino', selected:false},
    {label:'Method of transport', value:'by-transport', selected:false},
    {label:'Reason for pilgrimage', value:'by-reason', selected:false},
    {label:'Profession of pilgrims', value:'by-profession', selected:false},
    {label:'Spanish pilgrims by region of residence', value:'spanish-by-region', selected:false},
  ]).on('change', recomputePane)
  $('.main-header').append(G.mainSelect)
  G.mainContent.append(panel)
}

$(docReady);
