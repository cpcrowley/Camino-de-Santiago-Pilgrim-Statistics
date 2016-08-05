"use strict";

var options = [
  {tag:'by-month'},
  {tag:'by-age', field:'age'},
  {tag:'by-gender', field:'gender'},
  {tag:'by-country', field:'byCountry'},
  {tag:'by-camino', field:'caminos'},
  {tag:'by-starting-city', field:'startingCities'},
  {tag:'by-starting-region', field:'startingRegions'},
  {tag:'by-transport', field:'transport'},
  {tag:'by-reason', field:'motivation'},
  {tag:'by-profession', field:'professions'},
  {tag:'spanish-by-region', field:'spanishFrom'},
]
var years = ['2016', '2015', '2014', '2013', '2012', '2011', '2010',
'2009', '2008', '2007', '2006', '2005', '2004']
var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

var monthsForYear = year => {
  if (year === '2016') return months.slice(0,7)
  return months
}

var shared = {
  options: options,
  years: years,
  months: months,
  monthNames: monthNames,
  monthsForYear: monthsForYear,
}
