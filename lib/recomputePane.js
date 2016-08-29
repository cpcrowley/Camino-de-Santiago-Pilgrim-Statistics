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
  var isByTransport = (currentOption.tag==='by-transport')
  var isByProfession = (currentOption.tag==='by-profession')
  var isByAge = (currentOption.tag==='by-age')
  var isByCountry = (currentOption.tag==='by-country')
  var tableSpec = currentOption.tableSpec || {}

  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------
  var resultsDiv = $('<div class="table-responsive results-div"><div>')

  //----------------------------------------------------------------------------
  // Generate the contents of all the cells
  // NOTE: We will generate the cell content one column at a time and then,
  // at the end, transpose the cell matrix. It is simpler to do this the way
  // we present the data.
  //----------------------------------------------------------------------------
  var cells = []
  var headerRows = 0
  var fullLabels = null

  var labels = isMonthOption ? shared.monthNames : combinedLabels(currentOption.field)

  if (isByAge) {
    // Rearrange so that "< 30" is first
    var temp = labels[1]
    labels[1] = labels[0]
    labels[0] = temp
  }

  function addNBSPtoY(s) {return s.replace(' y ', '&nbsp;y ')}
  function addNBSPtoAmpersand(s) {return s.replace(' & ', '&nbsp;&amp; ')}
  function removeDashs(s) {return s.replace(' - ', '- ')}

  var currentRow = [currentOption.title, 'All']
  var translation
  _.forEach(labels, function(label) {
    var printLabel = addNBSPtoY(removeDashs(label))
    if (isByTransport) {
      translation = globals.translateTransport[label]
      if (translation) printLabel += `<br/>(${translation})`
    } else if (isByProfession) {
      translation = globals.translateProfession[label]
      if (translation) printLabel += `<br/>(${translation})`
    } else if (isByAge) {
      if (printLabel==='30- 60') {
        // Use a non-breaking hyphen
        printLabel = '30&#8209;60'
      }
    } else if (isByCountry) {
      translation = globals.countrySpanishToEnglish[label]
      if (translation) printLabel += `<br/>(${translation})`
    } else if (printLabel==='León') {
      printLabel += ` <span style="visibility:hidden">Leon</span>`
    }
    currentRow.push(printLabel)
  })
  cells.push(currentRow)
  ++headerRows

  /*if (currentOption.tag === 'by-country') {
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
  }*/

  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------
  var extendedYears = ['2004-2016'].concat(shared.years)
  if (isMonthOption) extendedYears = shared.years

  _.forEach(extendedYears, function(year) {
    currentRow = []

    var yearLabel = '' + year
    if (year==='2016') yearLabel += ' (Jan-Jul)'
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

    html += `<tr>`
    _.forEach(rowOfCells, function(cell, colIndex) {
      var td = (rowIndex===0 || colIndex<headerRows) ? 'th' : 'td'
      if (colIndex === 0) {
        td += ' class="text-align-left"'
      }
      html += `<${td}>${cell?cell:'&nbsp;'}</${td}>`
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
