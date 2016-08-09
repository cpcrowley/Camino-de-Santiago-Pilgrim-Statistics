"use strict";

var maxDataColumns = 23

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var footerDiv = function(tag) {
  var html = ''
  switch (tag) {
    case 'by-month':
    break

    case 'by-age':
    break

    case 'by-gender':
    break

    case 'by-country':
    break

    case 'by-camino':
    break

    case 'by-starting-city':
    break

    case 'by-starting-region':
    html = `<a href="https://en.wikipedia.org/wiki/Provinces_of_Spain" target="_blank">
    Provinces of Spain</a>
    </div>`
    break

    case 'by-transport':
    html = `<div class="footer-div">
    Pie: by foot, Bicicleta: by bicycle,
    Caballo: by horse, Silla de ruedas: by wheelchair
    </div>`
    break

    case 'by-reason':
    break

    case 'by-profession':
    html = `<div class="footer-div">
    <p>We are from the United States and are not familiar with how professions are classified in Spain, or in Europe, so we don't fully understand these professional categories.  E.g., what is the difference between an "employee" and a "worker"?  We've done our best to translate the professions, but some may not be quite right.  We welcome your feedback!  cpcrowley@gmail.com</p>

    Estudiantes: Students,
    Empleados: Employees,
    Jubilados: Retirees,
    Liberales: ???,
    Tecnicos: Technical,
    Profesores: Teachers,
    Funcionarios: Civil Servants,
    Amas de Casa: Housewives,
    Parados: Unemployed,
    Directivos: Managers,
    Obreros: Workers,
    Artistas: Artists,
    Sacerdotes: Priests,
    Religiosas: Nuns,
    Agricultores: Farmers,
    Marinos: Sailers/Marines,
    Deportistas: Athletes,
    Oikoten: See
    <a href="https://newint.org/features/2012/07/01/redemption-road-pilgrimage/" target="_blank">
    here</a>
    </div>`
    break

    case 'spanish-by-region':
    break
  }
  return $(html)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var appendTotalsTable = function(params, pane) {

  // NOTE: params[2] if for the debug checkbox, change this if you remove it.

  var maxColumns = parseInt(params[1],10)
  maxDataColumns = maxColumns - 2 // 2 for "Year" and "All"
  var columnMin = (maxColumns === 9990) ? 10 : 0

  var currentOption = _.find(shared.options, function(option) {
    if (params[0]===option.tag) return option
  })
  if (!currentOption) {
    console.log('no option match for ' + params[0])
    currentOption = shared.options[0]
  }
  var isMonthOption = (currentOption.tag==='by-month')
  var isByRegion = (currentOption.tag==='by-starting-region')

  //----------------------------------------------------------------------------
  //----------------------------------------------------------------------------
  var resultsDiv = $('<div class="table-responsive results-div"><div>')

  //----------------------------------------------------------------------------
  // Generate the contents of all the cells
  //----------------------------------------------------------------------------
  var cells = []
  var headerRows = 0

  var labels = isMonthOption ? shared.monthNames : combinedLabels(currentOption.field)
  if (labels.length > maxDataColumns) labels = labels.slice(0, maxDataColumns)

  if (currentOption.tag==='by-age') {
    // Rearrange so that < is first
    var temp = labels[1]
    labels[1] = labels[0]
    labels[0] = temp
  }

  // Remove columns with small totals
  var totals = G.pData['2004-2016']['all']
  if (!isMonthOption) {
    var optionsField = totals[currentOption.field]
    labels = _.filter(labels, function(label) {
      var p = _.find(optionsField, function(p) {return p[0]===label})
      if (!p) {
        console.log(`p null in label=${label}`, totals[currentOption.field])
      } else {
        return (p[1] >= columnMin)
      }
    })
  }

  var currentRow = ['Year', 'All']
  _.forEach(labels, function(label) { currentRow.push(addNBSPtoY(removeDashs(label))) })
  cells.push(currentRow)
  ++headerRows

  if (currentOption.tag === 'by-country') {
    currentRow = ['&nbsp;', '&nbsp;']
    _.forEach(labels, function(label) {
      var englishLabel = countrySpanishToEnglish[label]
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
    if (year==='2016') yearLabel += '<br/>(Jan-Jul)'
    if (year==='2004-2016') yearLabel += '<br/>(All years)'
    currentRow.push(yearLabel)

    var yearTotal = G.pData[year]['all'].pilgrims
    currentRow.push(numberWithCommas(yearTotal))
    var keys = labels
    if (isMonthOption) {
      keys = shared.monthsForYear(year)
    }
    if (keys.length > maxDataColumns) {
      keys = keys.slice(0, maxDataColumns)
    }

    _.forEach(keys, function(key) {
      var keyValue = 9999
      if (isMonthOption) {
        keyValue = G.pData[year][key]['pilgrims']
      } else {
        var indexOfLabel = labels.indexOf(key)
        var pair = _.find(G.pData[year]['all'][currentOption.field], function(p) {return p[0]===key})
        keyValue = pair ? pair[1] : 0
      }
      currentRow.push(numberWithCommas(keyValue)
      +  '<br/>' + (100*keyValue/yearTotal).toFixed(0) + '%')
    })
    cells.push(currentRow)
  })

  // Transpose the array of equal-length arrays, a matrix
  cells = _.zip.apply(_, cells)

  //----------------------------------------------------------------------------
  // Generate the html for the table
  //----------------------------------------------------------------------------
  var html = '<table class="table table-bordered table-striped">'

  _.forEach(cells, function(rowOfCells, index) {
    if (index === 0) html += '<thead>'
    if (index === headerRows) html += '</thead><tbody>'

    var td = 'td'
    if (index < headerRows) td = 'th'

    html += '<tr>'
    _.forEach(rowOfCells, function(cell) { html += `<${td}>${cell}</${td}>` })
    html += '</tr>'
  })

  html += '</tbody></table>';


  var totalsTable = $(html)
  resultsDiv.append(totalsTable).append(footerDiv(currentOption.tag))
  pane.form.append(resultsDiv)
  totalsTable.dataTable()
};

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
    G.pData[year]['all'][fieldName].forEach(function(pair) {addIfUniqueIn(pair[0], ret)})
  })
  return ret
}
