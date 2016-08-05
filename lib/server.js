"use strict";

const PORT = 3867;

var totalsCall = null
if (typeof LOCAL === 'undefined') {
  totalsCall = require('./totalsPane')
} else {
  totalsCall = makeTotalsHTML
}

var aboutHtml = `
<div class="results-div">
<h4>About</h4>

<p>
This site was created by Charlie and Wynette,
<a href="http://wynchar.com/">wynchar.com</a>.
You can find links to the blogs for our three Caminos at our website.
You can contact us at cpcrowley@gmail.com.  Please do so if you have any suggestions, questions, or corrections.
</p>

<p>
The data used here are taken from the
<a href="https://oficinadelperegrino.com/en/pilgrims-reception-office/">
Pilgrim's Office</a> site (English version).
The actual statistics page is
<a href="https://oficinadelperegrino.com/en/statistics/">here</a>.
Note the statistics page is not in English despite the "en" in the URL.
</p>

<p>
We created this site because we found it hard to get the statistics about Camino de Santiago pilgrims easily and quickly from the Cathedral de Santiago site.  Since we started looking at the statistics, the Pilgrims's Office has taken over the site and it seems faster. Still, it is hard to compare years since you can only see one year or month at a time. We created this site to help with that.
</p>

<p>
<b>Technical Information: </b>
Originally we collected the data as HTML and converted it to a JSON files.
Recently the Pilgrim's Office converted the page into a web app that
gets the data in JSON form from an HTTP POST request.
This is how we get the raw JSON data. We combine that into a single JSON
input file. This is read by the node.js server that serves HTML pages
to the web page.
</p>

<p>
The Github page for the web page and node.js server is
<a href="https://github.com/cpcrowley/Camino-de-Santiago-Pilgrim-Statistics">
here</a>. The data files are in that Github repository.
Or email us if you would like a copy of the JSON data.
</p>
</div>
`

var regionsHtml = `
<div class="results-div">
<h4>Regions of Spain</h4>
<img src="https://upload.wikimedia.org/wikipedia/commons/5/5a/Provinces_of_Spain.svg">
</div>
`

var notes = function() {
  function li(title, text) { return '<li><b>'+title+'</b><p>'+text+'</p></li>'}
  function firstSection(title) { return `</ul></li><li><b>${title}</b><ul>` }
  function nextSection(title) { return `</ul></li><li><b>${title}</b><ul>` }

  var html = `<div class="results-div">
  <h3>Observations about the statistics</h3><ul>`

  + firstSection('About the tables')
  + li('Controlling what is shown in the table',
  `The <em>Breakdown by</em> selection box allows you to select what information
  you want to see in the table.`)
+ li('Breakdown by year',
  `The left column of every table is the year of the statistics.
  The Pilgrims's Office only publishes statistics starting in 2004.`)
  + li('Number of pilgrims',
  `The second column in every table is the <em>ALL</em> fields which gives
  the total number of pilgrims in that year.`)
  + li('Third column and to the right',
  `The specific data for the table starts in the third columns.
  Each entry has a total and a percentage of the <em>ALL</em> count.`)
  + li('Number of columns',
  `Many tables have a large number of columns.
  The selection box at the top controls how many columns the table contains.`)
  + li('Percentages',
  `All percentages are rounded to the nearest whole percent.
  So a "1%" is really anything from 0.5% to 1.49999% percent and a "0%"
  is really from 0.0% to 0.499999%.`)

  + nextSection('Number of pilgrims')
  + li('Totals',
  `The total number of pilgrims is steadily increasing over the years.
  (The exceptions are on Holy Years, see below).
  The total seems to be going up about 10% per year.`)
  + li('Holy years',
  `2004 and 2010 were <em>Holy Years</em> when the church allows more generous
  indulgences for walking the Camino. There are always many more pilgrims
  in Holy Years.`)

  + nextSection('Age of pilgrims')
  + li('The age ranges',
  `These are the ranges that the Pilgrim's Office collects.`)
  + li('Stability',
  `The percentages are generally stable.
  The over-60 range is creeping up a little each year.`)

  + nextSection('Month they completed the Camino')
  + li('One month after starting',
  `Pilgrims usually take about a month to finish the Camino so these
  ending times are probably about a month after the starting times.`)
+ li('High summer: July and August',
  `These two months have about 40% of the completions.
  August is consistently the top month although it has been creeping
  down as the years go by and the Camino gets more and more popular.
  July is the the next most popular month.`)
  + li('Low summer: June and September',
  `Each of these months is about 14% of the total.
  So the four summer months are alomost 70% of the total.`)
  + li('Near summer: April, May and October',
  `April is around 7%, May is around 12% and October around 10%.`)
  + li('Near Winter: March and November',
  `Each of these is around 2%.`)
  + li('Winter: January, February and December',
  `Each of these is around 1%.`)

  + nextSection('Gender of pilgrims')
  + li('Trends',
  `The split is roughly equal with slightly more men: 52% to 48%.
  The split has been slowing trending towards equality over the years.`)

  + nextSection('Country of Origin')
  + li('Spanish pilgrims',
  `Close to 50% of the pilgrims come from Spain.`)
  + li('Germany',
  `Germany got a "Hape Kerkeling bump" in the mid-2000s and is now settling
  down to around 8%.`)
  + li('USA',
  `Contrary to expectations, the USA did not get much of a bump from
  <em>The Way</em> and is steadily around 5%.`)
  + li('Ireland',
  `Ireland has more pilgrims than you would expect from their population.`)
  + li('Korea',
  `Korea also has a lot of pilgrims considering how far Korea is from Spain.`)

+ nextSection('Which Camino they traveled')
  + li('Camino Frances',
  `This has always been the most popular but it has been declining in
  percentage (but not total pilgrims) over the years as other
  Caminos get more popular.`)
  + li('Camino Portuguese',
  `This has been slowly increasing over the years.`)
  + li('Multiple Caminos',
  `One might suspect that there is an increase in people walking a Camino
  multiple times. After walking the Camino Frances one or two times
  they are likely to try one of the other Caminos.
  But there are no statistics from the Pilgrim's Office indicating how
  many people have done multiple caminos.`)

  + nextSection('Where they started by city')
  + li('The data',
  `These are the numbers and place name spelling directly from the
  Pilgrim's Office data. There are so many starting places that it is
  hard to conclude much from the data.`)
  + li('Sarria',
  `Sarria is the most popular starting point: around 25% of pilgrims start
  there.  Sarria is the place to start on the Camino Frances if you want
  to walk 100 km and get a Compostela.`)
  + li('St. Jean P. Port',
  `St. Jean is second with 12%.
  This is the accepted beginning point of a complete Camino Frances.`)
  + li('Oporto',
  `Porto, Portugal, is a very popular place to start the Camino Portuguese.
  Tui, Spain, is the first town in Spain on the Camino Portuguese so is a popular starting place for an all-Spain Camino Portuguese.
  Together Porto and Tui add up to 10-12%.`)

  + nextSection('Where they started by province or country')
  + li('How this table is grouped',
  `Since the city starting places are so numerous we decided to group
  by province (in Spain) or country (out of Spain).
  We broke out Sarria and St. Jean because so many people start there.`)
  + li('León',
  `León, the city, is 4% and the province is 10%.`)

  + nextSection('Method of transport')
  + li('Titles',
  `We left the titles as they come from the Pilgrim's Office data.
  <em>Pie</em> is walking, <em>Bicicleta</em> is by bicycle, <em>Caballo</em>
  is by horse and <em>Silla de ruedas</em> is by wheelchair.`)
  + li('Walking',
  `Up from 80% to 90%.`)
  + li('Wheelchair',
  `2014 saw a big increase. It is not clear why this is.`)

  + nextSection('Reason for pilgrimage')
  + li('Overall',
  `Pretty consistent`)

  + nextSection('Profession of pilgrims')
  + li('Categories',
  `The profession titles collected by the Pilgrim's Office are a little
  mysterious to us English speakers. See _____ for our best attempt
  at a translation.`)

  + nextSection('Spanish pilgrims by region of residence')
  + li('Overall',
  `Not much surprising here. Numbers seem to be roughly in line with
  the populations of the regions.`)


  +`</ul></li></ul>`
  return html
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
function handleRequest(request, response){
  var ret = ''
  var url = request.url
  var args = []

  var firstqm = url.indexOf('?')
  if (firstqm > 0) {
    url = request.url.substring(0, firstqm)
    var argParts = request.url.substring(firstqm+1).split('&')
    argParts.forEach(function(argPart) {
      args.push(argPart.split('=')[1])
    })
  }

  console.log(`REQUEST from ${request.headers.origin}
    (${request.headers["user-agent"]})`)

  var okHTMLHeaders = {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'}
  switch (url) {

    case '/totals':
    ret = totalsCall(args)
    response.writeHead(200, okHTMLHeaders);
    break

    case '/regions':
    ret = regionsHtml
    response.writeHead(200, okHTMLHeaders);
    break

    case '/about':
    ret = aboutHtml
    response.writeHead(200, okHTMLHeaders);
    break

    case '/notes':
    ret = notes()
    response.writeHead(200, okHTMLHeaders);
    break

    case '/favicon.ico':
    ret = '<h1>IGNORING /favicon.ico</h1>'
    response.writeHead(200, okHTMLHeaders);
    break

    default:
    ret = '<h1>ERROR: Unknown path "' + request.url + '"</h1>'
    console.log('ERROR path: ' + request.url)
    response.writeHead(404, okHTMLHeaders);
    break;
  }
  response.end(ret)
}

var server = require('http').createServer(handleRequest);
server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});
