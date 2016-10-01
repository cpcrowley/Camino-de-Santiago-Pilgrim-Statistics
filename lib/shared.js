"use strict";
//------------------------------------------------------------------------------
// This is shared between the node fetching functions and the web app.
//------------------------------------------------------------------------------

var years = ['2016', '2015', '2014', '2013', '2012', '2011', '2010',
'2009', '2008', '2007', '2006', '2005', '2004']
var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

var monthsForYear = function(year) {
  if (year === '2016') return months.slice(0,8)
  return months
}

module.exports = {
  years: years,
  months: months,
  monthNames: monthNames,
  monthsForYear: monthsForYear,
}
