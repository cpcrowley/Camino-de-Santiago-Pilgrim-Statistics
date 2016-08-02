"use strict";
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var about = function() {
  var html = `
  <div class="results-div">
  <h4>About</h4>
  <p>I created this site because I found it hard to get the statistics about
  Camino de Santiago pilgrims easily and quickly from the Cathedral de Santiago site.</p>
  <p>The data used here are taken from the
    <a href="http://j-archive.com/">Cathedral de Santiago</a> site.
    I collected the data and converted it to a JSON files
    which the server reads in and searches to get the data.
    Everything is written in JavaScript and uses node.js.</p>
  <p>If there are any statistics you want the site to compute
    send me an email and I will try to add it.</p>
  <p>Contact me at cpcrowley@gmail.com</p>

  <h4>Help</h4>
  <p>TBD</p>
  </div>
  `
  return html
}
module.exports = about