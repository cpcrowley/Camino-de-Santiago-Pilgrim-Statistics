"use strict";
var _ = require('lodash')

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var pData = require('../data/pData.json')
var mainContent = null
var mainSelect = null
var graphShowPercents = true
var graphMaxLines = 16
var graphInvert = true

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var allOrderableFalse = _.fill(new Array(15), {"orderable":false})
var options = [
  {tag:'by-month', title:'Month',
  //graph2:'by-month-counts.png',
  graph:'by-month-percents.png',
  tableSpec:{
    "lengthChange": false,
    "searching": false,
    "info": false,
    "paging": false,
    "pageLength": 15,
    "ordering": false
  }},
  {tag:'by-age', title:'Age', field:'age',
  //graph2:'by-age-counts.png',
  graph:'by-age-percents.png',
  tableSpec:{
    "lengthChange": false,
    "searching": false,
    "info": false,
    "paging": false,
    "ordering": false
  }},
  {tag:'by-gender', title:'Gender', field:'gender',
  //graph2:'by-gender-counts.png',
  graph:'by-gender-percents.png',
  tableSpec:{
    "lengthChange": false,
    "searching": false,
    "info": false,
    "paging": false,
    "ordering": false
  }},
  {tag:'by-country', title:'Country', field:'byCountry',
  //graph:'by-country-counts-reversed.png',
  //graph2:'by-country-counts.png',
  graph:'by-country-percents-reversed.png',
  //graph4:'by-country-percents.png',
  tableSpec:{
    "lengthMenu": [[15, 25, 50, 100, -1], [15, 25, 50, 100, "All"]],
    "language": { "lengthMenu": "Show _MENU_ lines per page" },
    "ordering": false
  }},
  {tag:'by-starting-city', title:'Started At', field:'startingCities',
  //graph:'by-starting-city-counts-reversed.png',
  //graph2:'by-starting-city-counts.png',
  graph:'by-starting-city-percents-reversed.png',
  //graph2:'by-starting-city-percents.png',
  tableSpec:{
    "lengthMenu": [[15, 25, 50, 100, -1], [15, 25, 50, 100, "All"]],
    "language": { "lengthMenu": "Show _MENU_ lines per page" },
    "ordering": false
  }},
  {tag:'by-starting-region', title:'Region', field:'startingRegions',
  //graph:'by-starting-region-counts-reversed.png',
  //graph2:'by-starting-region-counts.png',
  graph:'by-starting-region-percents-reversed.png',
  //graph2:'by-starting-region-percents.png',
  tableSpec:{
    "lengthMenu": [[15, 25, 50, 100, -1], [15, 25, 50, 100, "All"]],
    "language": { "lengthMenu": "Show _MENU_ lines per page" },
    "ordering": false
  }},
  {tag:'by-camino', title:'Camino', field:'caminos',
  //graph2:'by-camino-counts.png',
  graph:'by-camino-percents.png',
  tableSpec:{
    "lengthChange": false,
    "searching": false,
    "info": false,
    "paging": false,
    "ordering": false
  }},
  {tag:'by-transport', title:'Travel', field:'transport',
  //graph2:'by-transport-counts.png',
  graph:'by-transport-percents.png',
  tableSpec:{
    "lengthChange": false,
    "searching": false,
    "info": false,
    "paging": false,
    "ordering": false
  }},
  {tag:'by-reason', title:'Motivation', field:'motivation',
  tableSpec:{
    "lengthChange": false,
    "searching": false,
    "info": false,
    "paging": false,
    "ordering": false
  }},
  {tag:'by-profession', title:'Profession', field:'professions',
  tableSpec:{
    "pageLength": 20,
    "lengthChange": false,
    "searching": false,
    "info": false,
    "paging": false,
    "ordering": false
  }},
  {tag:'spanish-by-region', title:'Region', field:'spanishFrom',
  tableSpec:{
    "pageLength": 25,
    "lengthChange": false,
    "searching": false,
    "info": false,
    "paging": false,
    "ordering": false
  }},
]

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var makeSelect = function(idBase, label, afterLabel, items) {
  var html = ''
  if (label) html += `<span class="form-label">${label}</span>`
  html += `<select id="${idBase}" name="${idBase}" class="${idBase}">`
  items.forEach(function(item) {
    html += `<option ${item.selected?'selected ':''}value="${item.value}">${item.label}</option>`
  })
  html += '</select>'
  if (afterLabel) html += `<span class="form-label">${afterLabel}</span>`
  return $(html)
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var about = function() {
  var html = `
  <div class="results-div">

  <img src="./images/caminoMarker.png" class="pull-right in-text-img">

  <p><span class="list-item-title">What?</span>
  This site summarizes data from the
  <a href="https://oficinadelperegrino.com/en/statistics/" target="_blank">Pilgrim's Office data page</a>
  about pilgrims finishing the Camino de Santiago.
  </p>

  <p><span class="list-item-title">How?</span>
  Choose a table to look at from the selection box at the top of this page
  (it currently shows "About this site")
  </p>

  <p><span class="list-item-title">Why?</span>
  We created this site because we found it hard to get the statistics about
  Camino de Santiago pilgrims easily and quickly from the Cathedral de Santiago site.
  Since we started looking at the statistics,
  the Pilgrims's Office has taken over the site and it seems faster.
  Still, it is hard to compare years since you can only see one year or month at a time.
  We created this site to help with that.
  </p>

  <p><span class="list-item-title">Who?</span>
  This site was created by Charlie and Wynette.
  You can find links to the blogs for our three Caminos at our
  <a href="http://wynchar.com/" target="_blank">website</a>.
  You can contact us at cpcrowley@gmail.com.
  Please do so if you have any suggestions, questions, or corrections.
  </p>

  <p><span class="list-item-title">The Data:</span>
  The data used here are taken from the
  <a href="https://oficinadelperegrino.com" target="_blank">Pilgrim's Office</a> site.
  The actual statistics page is
  <a href="https://oficinadelperegrino.com/en/statistics/" target="_blank">here</a>.
  Note the statistics page is not in English despite the "en" in the URL.
  </p>

  <p><span class="list-item-title">Changes and Corrections:</span>
  You can help by sending in any changes you would like to see, or corrections, or typos, etc.
  </p>

  <p><span class="list-item-title">Technical Information: </span>
  Originally we collected the data as HTML and converted it to a JSON files.
  Recently the Pilgrim's Office converted the page into a web app that
  gets the data in JSON format from an HTTP POST request.
  This is how we get the raw JSON data. We combine that into a single JSON
  input file. This is read by the web page.
  The Github page for the web page and node.js data preparation programs is
  <a href="https://github.com/cpcrowley/Camino-de-Santiago-Pilgrim-Statistics" target="_blank">
  here</a>. The data files are in that Github repository.
  Or email us if you would like a copy of the JSON data.
  </p>

  <p><span class="list-item-title">Last updated</span>
  on September 30, 2016.
  </p>

  <hr>

  <h3>Observations about the statistics</h3>
  <img src="./images/outsideCastrjeriz.jpg" class="pull-right in-text-img">

  <p><span class="list-item-title">At the bottom of each table</span>
  At the bottom of each table are some observations about the data in that table.
  </p>

  <p><span class="list-item-title">Charts</span>
  All pages have a table and a chart of the data.
  </p>

  <p><span class="list-item-title">Years covered</span>
  The Pilgrims's Office publishes statistics starting in 2004.
  </p>

  <p><span class="list-item-title">Percentages</span>
  All percentages are rounded to the nearest whole percent.
  So a "1%" is really anything from 0.5% to 1.49% percent and a "0%"
  is really from 0.0% to 0.49%.
  So it can show 0% and the raw data might not be 0.
  </p>

  <p><span class="list-item-title">Totals</span>
  The total number of pilgrims is steadily increasing over the years.
  The total seems to be going up about 10% per year.
  The exceptions are on Holy Years.
  </p>

  <p><span class="list-item-title">Holy years</span>
  2004 and 2010 were <em>Holy Years</em> when the church allows more generous
  indulgences for walking the Camino. There are always many more pilgrims
  in Holy Years.
  </p>

  </div>
  `
  return html
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var footerDiv = function(tag) {
  var html = ''
  switch (tag) {
    case 'by-month':
    html = `<div class="footer-div">

    <ul>

    <li><span class="list-item-title">One month after starting</span>
    Pilgrims usually take about a month to finish the Camino so these
    ending times are about a month after the starting times.</li>

    <li><span class="list-item-title">High summer: July and August</span>
    These two months have about 40% of the completions.
    August is consistently the top month although it has been creeping
    down as the years go by and the Camino gets more and more popular.
    July is the the next most popular month.</li>

    <li><span class="list-item-title">Low summer: June and September</span>
    Each of these months is about 14% of the total.
    So the four summer months are almost 70% of the total.</li>

    <li><span class="list-item-title">Near summer: April, May and October</span>
    April is around 7%, May is around 12% and October around 10%.</li>

    <li><span class="list-item-title">Near Winter: March and November</span>
    Each of these is around 2%.</li>

    <li><span class="list-item-title">Winter: January, February and December</span>
    Each of these is around 1%.</li>

    </ul>

    </div>`
    break

    case 'by-age':
    html = `<div class="footer-div">

    <ul>

    <li><span class="list-item-title">The age ranges</span>
    These are the ranges that the Pilgrim's Office collects:
    Under 30, 30 to 60, and over 60.</li>

    <li><span class="list-item-title">Stability</span>
    The percentages are generally stable.
    The over-60 range is creeping up a little each year.</li>

    </ul>

    </div>`
    break

    case 'by-gender':
    html = `<div class="footer-div">

    <ul>

    <li><span class="list-item-title">Trends</span>
    The split is roughly equal with slightly more men: 52% to 48%.
    The split has been slowing trending towards equality over the years.</li>

    </ul>

    </div>`
    break

    case 'by-country':
    html = `<div class="footer-div">

    <ul>

    <li><span class="list-item-title">Spanish pilgrims</span>
    Close to 50% of the pilgrims come from Spain.</li>

    <li><span class="list-item-title">Germany</span>
    Germany got a "Hape Kerkeling bump" in the 2005-2009 and then settles
    down to around 8%.</li>

    <li><span class="list-item-title">USA</span>
    The bump of pilgrims from the USA from <em>The Way</em> moved the USA
    to from around 2% to around 5%.</li>

    <li><span class="list-item-title">Ireland</span>
    Ireland has more pilgrims than you would expect from their population.</li>

    <li><span class="list-item-title">Korea</span>
    Korea also has a lot of pilgrims considering how far Korea is from Spain.</li>

    </ul>

    </div>`
    break

    case 'by-camino':
    html = `<div class="footer-div">

    <ul>

    <li><span class="list-item-title">Camino Frances</span>
    This has always been the most popular but it has been slowly declining in
    percentage (but not total pilgrims) over the years as other
    Caminos get more popular.</li>

    <li><span class="list-item-title">Camino Portuguese</span>
    This has been slowly increasing over the years gaining on the Camino Frances.</li>

    <li><span class="list-item-title">Multiple Caminos</span>
    One might suspect that there is an increase in people walking a Camino
    multiple times. After walking the Camino Frances one or two times
    they are likely to try one of the other Caminos.
    But there are no statistics from the Pilgrim's Office indicating how
    many people have done multiple caminos.</li>

    </ul>

    </div>`
    break

    case 'by-starting-city':
    html = `<div class="footer-div">

    <ul>

    <li><span class="list-item-title">The data</span>
    These are the numbers and place name spelling directly from the
    Pilgrim's Office data. There are so many starting places that it is
    hard to conclude much from the data.</li>

    <li><span class="list-item-title">Sarria</span>
    Sarria is the most popular starting point: around 25% of pilgrims start
    there.  Sarria is the place to start on the Camino Frances if you want
    to walk 100 km and get a Compostela.</li>

    <li><span class="list-item-title">St. Jean P. Port</span>
    St. Jean is second with 12%.
    This is the accepted beginning point of a complete Camino Frances.</li>

    <li><span class="list-item-title">Oporto</span>
    Porto, Portugal, is a very popular place to start the Camino Portuguese.
    Tui, Spain, is the first town in Spain on the Camino Portuguese so is a popular starting place for an all-Spain Camino Portuguese.
    Together Porto and Tui add up to 10-12%.</li>

    <li><span class="list-item-title">Holy Years</span>
    In Holy years the percent starting in Sarria goes up and the
    percent starting in St. Jean goes down.</li>

    </ul>

    </div>`
    break

    case 'by-starting-region':
    html = `<a href="https://en.wikipedia.org/wiki/Provinces_of_Spain" target="_blank">
    Provinces of Spain</a>

    <ul>

    <li><span class="list-item-title">How this table is grouped</span>
    Since the city starting places are so numerous we decided to group
    by province (in Spain) or country (out of Spain).</li>

    <li><span class="list-item-title">León</span>
    León, the city, is 4% and the province is 10%.</li>

    <li><span class="list-item-title">Holy Years</span>
    In Holy years the percent starting in Lugo goes up and the
    percent starting in Frances goes down.</li>

    </ul>

    </div>`
    break

    case 'by-transport':
    html = `<div class="footer-div">

    <p><span class="list-item-title">Walking</span>
    Up from 80% to 90%.</li>
    </p>

    <p><span class="list-item-title">Wheelchair</span>
    2014 saw a big increase. It is not clear why this is.</li>
    </p>

    <p><span class="list-item-title">Titles</span>
    We left the titles as they come from the Pilgrim's Office data.
    </p>

    </div>`
    break

    case 'by-reason':
    html = `<div class="footer-div">

    <ul>

    <li><span class="list-item-title">Pretty consistent over the years</span>
    The percent for religious reasons goes up in Holy years which makes sense.</li>
    </ul>

    </div>`
    break

    case 'by-profession':
    html = `<div class="footer-div">

    <p><span class="list-item-title">Categories:</span>
    We are from the United States and are not familiar with how professions are classified in Spain, or in Europe, so we don't fully understand these professional categories.  E.g., what is the difference between an "employee" and a "worker"?  We've done our best to translate the professions, but some may not be quite right.  We welcome your feedback!  cpcrowley@gmail.com</p>

    </div>`
    break

    case 'spanish-by-region':
    html = `<div class="footer-div">

    <ul>

    <li><span class="list-item-title">Overall</span>
    Not much surprising here. Numbers seem to be roughly in line with
    the populations of the regions.</li>

    <li><span class="list-item-title">Galicia in Holy Years</span>
    Normally the percentages don't change much from year to year,
    but the percent from Galicia in Holy years goes way up.
    I'm not sure why that would be.</li>

    </ul>

    </div>`
    break
  }
  return $(html)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var countrySpanishToEnglish = {
  "Alemania":"Germany",
  "Afganistán":"Afghanistan",
  "Andorra":"Andorra",
  "Angola":"Angola",
  "Antigua y Barbuda":"Antigua & Barbuda",
  "Arabia Saudita":"Saudi Arabia",
  "Armenia":"Armenia",
  "Argelia":"Algeria",
  "Argentina":"Argentina",
  "Austria":"Austria",
  "Australia":"Australia",
  "Azerbaiyán":"Azerbaijan",
  "Belgica":"Belgium",
  "Bielorrusia":"Belarus",
  "Bolivia":"Bolivia",
  "Brasil":"Brazil",
  "Cabo Verde":"Cape Verde",
  "Camerún":"Cameroon",
  "Canadá":"Canada",
  "Chile":"Chile",
  "China":"China",
  "Chipre":"Cyprus",
  "Colombia":"Colombia",
  "Comores":"Comoros",
  "Corea":"Korea",
  "Costa de Marfil":"Ivory Coast",
  "Costa Rica":"Costa Rica",
  "Croacia":"Croatia",
  "Cuba":"Cuba",
  "Dinamarca":"Denmark",
  "Dominica":"Dominican Republic",
  "Ecuador":"Ecuador",
  "Egipto":"Egypt",
  "El Salvador":"El Salvador",
  "Emiratos Arabes Unidos":"U Arab Emirates",
  "Espana":"Spain",
  "España":"Spain",
  "Eslovaquia":"Slovakia",
  "Eslovenia": "Slovenia",
  "Estados Unidos":"USA",
  "Etiopia":"Ethiopia",
  "Filipinas":"Philippines",
  "Finlandia":"Finland",
  "Francia":"France",
  "Gabón":"Gabon",
  "Grecia":"Greece",
  "Groenlandia":"Greenland",
  "Guatemala":"Guatemala",
  "Haití":"Haiti",
  "Holanda":"Holland",
  "Holandesas":"Netherlands",
  "Hungría":"Hungary",
  "India":"India",
  "Indonesia":"Indonesia",
  "Irán":"Iran",
  "Irlanda":"Ireland",
  "Islandia":"Iceland",
  "Islas Feroe":"Faroe Islands",
  "Islas Malvinas":"Falkland Islands",
  "Israel":"Israel",
  "Italia":"Italy",
  "Japón":"Japan",
  "Jordania":"Jordan",
  "Kazajistán":"Kazakhstan",
  "Kirguistán":"Kyrgyzstan",
  "Letonia":"Latvia",
  "Líbano":"Lebanon",
  "Lituania":"Lithuania",
  "Luxemburgo":"Luxemburg",
  "Malasia":"Malaysia",
  "Martinica":"Martinique",
  "México":"Mexico",
  "Moldavia":"Moldavia",
  "Mónaco":"Monaco",
  "Nueva Caledonia":"New Caledonia",
  "Noruega":"Norway",
  "Nueva Zelanda":"New Zealand",
  "Omán":"Oman",
  "Pakistán":"Pakistan",
  "Panamá":"Panama",
  "Papúa - Nueva Guinea":"Papua New Guinea",
  "Paraguay":"Paraguay",
  "Perú":"Peru",
  "Polonia":"Poland",
  "Portugal":"Portugal",
  "Puerto Rico":"Puerto Rico",
  "Reino Unido":"UK",
  "Rep. Dominicana":"Dom. Rep.",
  "Rep. Centroafricana":"Central African Rep.",
  "República Checa":"Czech Rep.",
  "Roumania":"Romania",
  "Rumania":"Romania",
  "Rusia":"Russia",
  "Rumania":"Roumania",
  "Samoa Occidental":"Westrn Samoa",
  "Singapur":"Singapore",
  "Sierra Leona":"Sierra Leone",
  "Siria":"Syria",
  "Sudán":"Sudan",
  "Sudáfrica":"S. Africa",
  "Suecia":"Sweden",
  "Suiza":"Switzerland",
  "Swazilandia":"Swaziland",
  "Tailandia":"Thailand",
  "Taiwán":"Taiwan",
  "Timor Oriental":"East Timor",
  "Trinidad y Tobago":"Trinidad & Tobago",
  "Túnez":"Tunisia",
  "Turquía":"Turkey",
  "Ucrania":"Ukraine",
  "Urbekistán":"Uzbekistan",
  "Uruguay":"Uruguay",
  "Vanuatu":"Santo",
  "Venezuela":"Venezuela",
  "Bulgaria": "Bulgaria",
  "Estonia": "Estonia",
  "Malta": "Malta",
  "Nicaragua": "Nicaragua",
  "Honduras": "Honduras",
  "Marruecos": "Morocco",
  "Maldivas": "Maldives",
  "Namibia": "Namibia",
  "Serbia": "Serbia",
  "Albania": "Albania",
  "Sri Lanka": "Sri Lanka",
  "San Marino": "San Marino",
  "Madagascar": "Madagascar",
  "Bosnia": "Bosnia",
  "Tuvalu": "Tuvalu",
  "Kuwait": "Kuwait",
  "Bermudas": "Bermuda",
  "Gambia": "Gambia",
  "Nigeria": "Nigeria",
  "Zimbabwe": "Zimbabwe",
  "Kenya": "Kenya",
  "Macedonia": "Macedonia",
  "Eritrea": "Eritrea",
  "Botswana": "Botswana",
  "Palau": "Palau",
  "Guinea Ecuatorial": "Ecuatorial Guinea",
  "Antillas Holandesas": "Netherlands Antillas",
  "Jamaica": "Jamaica",
  "Nepal": "Nepal",
  "Granada": "Granada",
  "Ghana": "Ghana",
  "Burkina Faso": "Burkina Faso",
  "Lesotho": "Lesotho",
  "Mali": "Mali",
  "Yugoslavia": "Yugoslavia",
  "Barbados": "Barbados",
  "Surinam": "Surinam",
  "Irak": "Iraq",
  "Palestina": "Palestine",
  "Libia": "Libya",
  "Mauritania": "Mauritania",
  "Bangladesh": "Bangladesh",
  "Liechtensein": "Liechtenstein",
  "Mauricio": "Mauricio",
  "Camboya": "Cambodia",
  "Senegal": "Senegal",
  "Aruba": "Aruba",
  "Rwanda": "Rwanda",
  "Guyana": "Guyana",
  "Vietnam": "Vietnam",
  "Montenegro": "Montenegro",
  "Djibouti": "Djibouti",
  "Somalia": "Somalia",
  "Brunei": "Brunei",
  "Georgia": "Georgia",
  "Mozambique": "Mozambique",
  "Zambia": "Zambia",
  "Mongolia": "Mongolia",
  "Guam": "Guam",
  "Guinea": "Guinea",
  "Congo": "Congo",
  "Togo": "Togo",
  "Tanzania": "Tanzania",
  "Benin": "Benin",
  "Bahamas": "Bahamas",
  "Etiopía": "Etiopia",
  "Myanmar": "Myanmar",
  "Uganda": "Uganda",
  "I. Reunión": "Reunion Islands",
  "Laos": "Laos",
  "Fiji": "Fiji",
  "Santo Tomé y Príncipe": "Sao Tome & Principe",
  "Belice": "Belize",
  "Qatar": "Qatar",
  "Tayikistán": "Tayikistan",
  "Seychelles": "Seychelles",
  "Guinea - Bissau": "Guinea-Bissau",
  "Malawi": "Malawi",
  "Islas Caimán": "Cayman Islands",
  "Santa Lucía": "St. Lucia",
  "Chad": "Chad",
  "Bhután": "Bhutan",
  "Bahrein": "Bahrain",
  "Islas Vírgenes": "Virgin Islands",
  "Guayana Francesa": "French Guiana",
  "Liberia": "Liberia",
  "Turkmenistán": "Turkmenistan",
  "Herzegovina": "Herzegovina",
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var translateProfession = {
  "Estudiantes": "Students",
  "Empleados": "Employees",
  "Jubilados": "Retirees",
  "Liberales": "???",
  "Tecnicos": "Technical",
  "Profesores": "Teachers",
  "Funcionarios": "Civil Servants",
  "Amas de Casa": "Housewives",
  "Parados": "Unemployed",
  "Directivos": "Managers",
  "Obreros": "Workers",
  "Artistas": "Artists",
  "Sacerdotes": "Priests",
  "Religiosas": "Nuns",
  "Agricultores": "Farmers",
  "Marinos": "Sailers/Marines",
  "Deportistas": "Athletes",
  "Oikoten": `See <a href="https://newint.org/features/2012/07/01/redemption-road-pilgrimage/" target="_blank">
  here</a>`
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var translateTransport = {
  "Pie": "Walking",
  "Bicicleta": "Bicycle",
  "Caballo": "Horse",
  "Silla de ruedas": "Wheelchair",
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
module.exports = {
  about: about,
  graphShowPercents: graphShowPercents,
  graphMaxLines: graphMaxLines,
  graphInvert: graphInvert,
  translateProfession: translateProfession,
  translateTransport: translateTransport,
  countrySpanishToEnglish: countrySpanishToEnglish,
  makeSelect: makeSelect,
  footerDiv: footerDiv,
  pData: pData,
  mainContent: mainContent,
  mainSelect: mainSelect,
  options: options,
}
