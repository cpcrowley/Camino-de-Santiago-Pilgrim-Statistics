var years = ['2015', '2014', '2013', '2012', '2011', '2010','2009', '2008', '2007', '2006', '2005', '2004']
var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
var options = [
  {tag:'by-month', type:'month',
  keys:months,
  labels:['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']},

  {tag:'by-age', type:'field',
  keys:['under30', 'from30to60', 'over60'],
  labels:['< 30', '30-60', '> 60']},

  {tag:'by-gender', type:'field',
  keys:['women', 'men'],
  labels:['Women', 'Men']},

  {tag:'by-country', type:'array', field:'foreigners'},

  {tag:'by-camino', type:'array', field:'caminos'},

  {tag:'by-starting-point', type:'array', field:'startingPlaces'},

  {tag:'by-transport', type:'field',
  keys:['walking', 'cycling', 'riding', 'wheelchair'],
  labels:['Walk', 'Bicycle', 'Horse', 'Wheelchair']},

  {tag:'by-reason', type:'field',
  keys:['religious', 'religiousCultural', 'cultural'],
  labels:['Religious', 'Religious/Cultural', 'Cultural']},

  {tag:'by-profession', type:'array', field:'professions'},

  {tag:'spanish-by-region', type:'array', field:'spanishFrom'},
]

module.exports = {options:options, years:years, months:months}
