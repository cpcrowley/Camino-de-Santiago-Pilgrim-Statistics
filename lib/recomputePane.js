"use strict";
var _ = require('lodash')

var globals = require('./globals.js')
var shared = require('./shared.js')

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var recomputePane = function() {
  globals.mainContent.find('.results-div').remove()
  var tag = globals.mainSelect.val()

  if (tag === 'about') {
    globals.mainContent.append(globals.about())
    return
  }

  if (!globals.pData) return

  var currentOption = _.find(globals.options, function(option) {
    if (tag===option.tag) return option
  })
  if (!currentOption) {
    console.log(`no option match for "${tag}"`)
    currentOption = globals.options[1]
  }
  var isMonthOption = (currentOption.tag==='by-month')
  var isByRegion = (currentOption.tag==='by-starting-region')
  var tableSpec = currentOption.tableSpec
  if (!tableSpec) tableSpec = {
    "lengthMenu": [[15, 25, 50, 100, -1], [15, 25, 50, 100, "All"]],
    "language": { "lengthMenu": "Show _MENU_ lines per page" },
    "ordering": false,
  }

  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------
  var resultsDiv = $('<div class="table-responsive results-div"><div>')

  /*if (currentOption.showMinPilgrimsSelect) {
    var m = globals.minPilgrimsInCol
    resultsDiv.append(globals.makeSelect('min-pilgrims-in-col', 'Show rows with at least ', ' pilgrims in 2004-2016', [
      {label:'1', value:'1', selected:m===1},
      {label:'10', value:'10', selected:m===10},
      {label:'100', value:'100', selected:m===100},
      {label:'1,000', value:'1000', selected:m===1000},
      {label:'10,000', value:'10000', selected:m===10000},
    ]).on('change', function() {
      globals.minPilgrimsInCol = parseInt(globals.mainContent.find('.min-pilgrims-in-col').val())
      recomputePane()
    }))
  }*/

  //----------------------------------------------------------------------------
  // Generate the contents of all the cells
  //----------------------------------------------------------------------------
  var cells = []
  var headerRows = 0

  var labels = isMonthOption ? shared.monthNames : combinedLabels(currentOption.field)

  if (currentOption.tag==='by-age') {
    // Rearrange so that < is first
    var temp = labels[1]
    labels[1] = labels[0]
    labels[0] = temp
  }

  // Remove columns with small totals
  var totals = globals.pData['2004-2016']['all']
  if (!isMonthOption) {
    var optionsField = totals[currentOption.field]
    labels = _.filter(labels, function(label) {
      var p = _.find(optionsField, function(p) {return p[0]===label})
      if (!p) {
        console.log(`p null in label=${label}`, totals[currentOption.field])
      } else {
        return (p[1] >= globals.minPilgrimsInCol)
      }
    })
  }

  var addNBSPtoY = function(s) {return s.replace(' y ', '&nbsp;y ')}
  var addNBSPtoAmpersand = function(s) {return s.replace(' & ', '&nbsp;&amp; ')}
  var removeDashs = function(s) {return s.replace(' - ', '- ')}

  var currentRow = [currentOption.title, 'All']
  _.forEach(labels, function(label) { currentRow.push(addNBSPtoY(removeDashs(label))) })
  cells.push(currentRow)
  ++headerRows

  if (currentOption.tag === 'by-country') {
    currentRow = ['&nbsp;', '&nbsp;']
    _.forEach(labels, function(label) {
      var englishLabel = globals.countrySpanishToEnglish[label]
      if (!englishLabel) {
        englishLabel= 'NoEnglish'
      }
      currentRow.push(addNBSPtoAmpersand(englishLabel))
    })
    cells.push(currentRow)
    ++headerRows
  }

  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------
  var extendedYears = ['2004-2016'].concat(shared.years)
  if (isMonthOption) extendedYears = shared.years
  _.forEach(extendedYears, function(year) {
    currentRow = []

    var yearLabel = '' + year
    if (year==='2016') yearLabel += ' (Jan-Jul)'
    //if (year==='2004-2016') yearLabel += '<br/>(All years)'
    currentRow.push(yearLabel)

    var yearTotal = globals.pData[year]['all'].pilgrims
    currentRow.push(numberWithCommas(yearTotal))
    var keys = labels
    if (isMonthOption) {
      keys = shared.monthsForYear(year)
    }

    _.forEach(keys, function(key) {
      var keyValue = 9999
      if (isMonthOption) {
        keyValue = globals.pData[year][key]['pilgrims']
      } else {
        var indexOfLabel = labels.indexOf(key)
        var pair = _.find(globals.pData[year]['all'][currentOption.field], function(p) {return p[0]===key})
        keyValue = pair ? pair[1] : 0
      }
      var cellValue = (!keyValue) ? '&nbsp;' : numberWithCommas(keyValue)
      +  '<br/>' + (100*keyValue/yearTotal).toFixed(0) + '%'
      currentRow.push(cellValue)
    })
    cells.push(currentRow)
  })

  // Transpose the array of equal-length arrays, a matrix
  cells = _.zip.apply(_, cells)

  //----------------------------------------------------------------------------
  // Generate the html for the table
  //----------------------------------------------------------------------------
  var html = '<table class="table table-bordered table-striped">'

  _.forEach(cells, function(rowOfCells, rowIndex) {
    if (rowIndex === 0) html += '<thead>'
    if (rowIndex === 2) html += '</thead><tbody>'

    html += '<tr>'
    _.forEach(rowOfCells, function(cell, colIndex) {
      var td = (rowIndex===0 || colIndex<headerRows) ? 'th' : 'td'
      html += `<${td}>${cell?cell:'&nbsp;'}</${td}>`
      //console.log(`${currentOption.tag}: i=${colIndex} cell=${cell}`)
    })
    html += '</tr>'
  })

  html += '</tbody></table>';


  var totalsTable = $(html)
  resultsDiv.append(totalsTable).append(globals.footerDiv(currentOption.tag))
  globals.mainContent.append(resultsDiv)
  totalsTable.dataTable(tableSpec)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var numberWithCommas = function(x) {return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var addIfUniqueIn = function(x,arr) {if (arr.indexOf(x) < 0) arr.push(x)}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var  combinedLabels = function(fieldName) {
  var ret = []
  _.forEach(shared.years, function(year) {
    globals.pData[year]['all'][fieldName].forEach(function(pair) {addIfUniqueIn(pair[0], ret)})
  })
  return ret
}
module.exports = recomputePane
