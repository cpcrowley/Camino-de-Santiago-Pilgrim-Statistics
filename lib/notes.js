"use strict";
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var notes = function() {
  function li(title, text) { return '<li><b>'+title+'</b><p>'+text+'</p></li>'}
  function firstSection(title) { return `</ul></li><li><b>${title}</b><ul>` }
  function nextSection(title) { return `</ul></li><li><b>${title}</b><ul>` }

  var html = `<div class="results-div">
  <h3>Observations about the statistics</h3><ul>`

  + firstSection('% correct by row')

  + li('Questions do get harder as you go down the rows',
  `You can see this by the % correct in each row, from 95% in row 1
  to 72% in row 5. And row 5 is a lot harder, 72% versus 81% for row 4.`)

  + li('The double jeopardy round is harder than Jeopardy round',
  `Especially in rounds 3, 4 and 5`)

  + li('Daily double questions are harder than regular questions in the same row',
  `The percent correct is almost 20% lower`)

  + li('The question difficulty has stayed roughly the same over the seasons',
  `Although the questions in seasons 6-10 were a little easier`)

  + li('Out-of-order clues',
  `<p>Usually players select clues from the top down, starting with the lowest dollar
  values. Sometines plaers chose a clue out of order, that is, before all the clues
  above it have boon chose. One reason to do this is to hunt for the daily doubles.
  Another reason is a accumulate money for quickly or to catch opponents off-guard.</p>
  <p>You can see that the percent correct goes down a little bit for out-of-order clues
  probably due to people not fully understanding how the category works.
  But the effect is faily small.</p>
  <p>The percent of clues that are out-of-order has been going up over the years.
  This is probably due to more sophisticated player strategies, mainly hunting for
  daily doubles.</p>`)

  + nextSection('% correct by player')

  + li('Title',
  `Text`)

  + nextSection('wins by player')

  + li('Only 28% make it past the first game',
  `Out of about 10,000 players, less than 3,000 win any games at all.
  It is hard to win on Jeopardy`)

  + li('The champion wins 44% of the time.',
  `28% for each of the two non-winners is 56%, so 44% for the winner.`)

  + nextSection('Most common categories')

  + li('There have been a lot of categories over the years',
  `Over 36,000 categories`)

  + li('Many categories are used multiple times',
  `Science with 156, Before & Afer with 129, and Potpourri with 124`)

  + nextSection('Find string in clues')

  + li('Interesting to play around with',
  `I thought that New Mexico came up a lot but all the states come up roughly
  the same number of times.`)

  +`</ul></li></ul>`

  return html
}

module.exports = notes
