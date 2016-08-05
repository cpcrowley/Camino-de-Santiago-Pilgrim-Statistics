"use strict";

var maxDataColumns = 23

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
  _.forEach(shared.years, (year) => {
    G.pData[year]['all'][fieldName].forEach((pair) => {addIfUniqueIn(pair[0], ret)})
  })
  return ret
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeTotalsHTML = (params) => {

  // NOTE: params[2] if for the debug checkbox, change this if you remove it.

  var maxColumns = parseInt(params[1],10)
  maxDataColumns = maxColumns - 2 // 2 for "Year" and "All"


  var currentOption = _.find(shared.options, option => {
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
  var html = '<div class="table-responsive results-div">'

  html += '<table class="table table-bordered table-striped">'
  html += '<tr><th>Year</th><th>All</th>'

  var labels = isMonthOption ? shared.monthNames : combinedLabels(currentOption.field)
  if (labels.length > maxDataColumns) labels = labels.slice(0, maxDataColumns)

  if (currentOption.tag==='by-age') {
    // Rearrange so that < is first
    var temp = labels[1]
    labels[1] = labels[0]
    labels[0] = temp
  }

  _.forEach(labels, (label) => { html += `<th>${label}</th>` })

  html += '</tr>'

  if (currentOption.tag === 'by-country') {
    html += '<tr><th>&nbsp;</th><th>&nbsp;</th>'
    _.forEach(labels, (label) => {
      var englishLabel = shared.countrySpanishToEnglish[label]
      if (!englishLabel) englishLabel= ''
      html += `<th>${englishLabel}</th>`
    })
    html += '</tr>'
  }

  _.forEach(shared.years, (year) => {
    html += `<tr>`
    var yearLabel = '' + year
    if (year==='2016') yearLabel += '<br/>(Jan-Jul)'
    html += `<td>${yearLabel}</td>`
    var yearTotal = G.pData[year]['all'].pilgrims
    html += `<td>${numberWithCommas(yearTotal)}</td>`
    var keys = labels
    if (isMonthOption) {
      keys = shared.monthsForYear(year)
    }
    if (keys.length > maxDataColumns) {
      keys = keys.slice(0, maxDataColumns)
    }

    _.forEach(keys, key => {
      var keyValue = 9999
      if (isMonthOption) {
        keyValue = G.pData[year][key]['pilgrims']
      } else {
        var indexOfLabel = labels.indexOf(key)
        var pair = _.find(G.pData[year]['all'][currentOption.field], p => p[0]===key)
        keyValue = pair ? pair[1] : 0
      }
      html += `<td>${numberWithCommas(keyValue)}
      <br/>${(100*keyValue/yearTotal).toFixed(0)}%</td>`
    })
  })
  html += '</tr>'

  html += '</table>';

  // Add to the footer of some pages
  switch (currentOption.tag) {
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
    break
    case 'by-transport':
    html += `<div class="footer-div">
    Pie: by foot, Bicicleta: by bicycle,
    Caballo: by horse, Silla de ruedas: by wheelchair
    </div>`
    break
    case 'by-reason':
    break
    case 'by-profession':
    html += `<div class="footer-div">
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
    Oikoten: Young delinquents from Belgium
</div>`
    break
    case 'spanish-by-region':
    break
  }
  html += '</div>';
  return html
};
