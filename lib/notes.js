"use strict";
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var notes = function() {
  function li(title, text) { return '<li><b>'+title+'</b><p>'+text+'</p></li>'}
  function firstSection(title) { return `</ul></li><li><b>${title}</b><ul>` }
  function nextSection(title) { return `</ul></li><li><b>${title}</b><ul>` }

  var html = `<div class="results-div">
  <h3>Observations about the statistics</h3><ul>`

  + firstSection('title')

  + li('observations',
  `Details.`) 


  + nextSection('section name')

  + li('Title',
  `Text`)


  +`</ul></li></ul>`

  return html
}

module.exports = notes
