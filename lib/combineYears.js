/*
 * This is run: node combineYears.js
 * It combines the monthly pilgrim data gotten by fetchong JSON from the web site
 * into one big file the the server.js program can read in.
 */
 "use strict";

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var fs = require('fs')
var _ = require('lodash')
var shared = require('./shared.js')
var cityToCountry = require('./cityToCountry.js')

var pData = {}
_.forEach(shared.years, function(year) {pData[year]={}})

var numStarted = 0
var numFinished = 0

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var totalByRegion = function(byCity) {
  var byRegion = []
  _.forEach(byCity, cityPair => {
    var region = cityToCountry[cityPair[0]]
    var regionName = 'ERROR'
    if (region) regionName = region.region
    else {
      console.log(`RegionNotDefined: city="${cityPair}" region=${region}`)
      regionName = 'RegionNotDefined'
    }
    var item = _.find(byRegion, regionPair => {
      if (regionName===regionPair[0]) return true
    })
    if (!item) {
      byRegion.push([regionName, cityPair[1]])
    } else {
      item[1] += cityPair[1]
    }
  })
  return byRegion
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var convertOneMonth = function(monthIn) {
  var nonNulls
  var monthOut = {
    year: monthIn.anio,
    month: monthIn.mes,
    pilgrims: parseInt(monthIn.nb_registros,10),
  }

  monthOut.gender = _.map(monthIn.sexos, item => [
    item.sexo_titulo,
    parseInt(item.nb_registros,10),
  ])

  monthOut.transport = _.map(monthIn.medios, item => [
    item.medio_titulo,
    parseInt(item.nb_registros,10),
  ])

  monthOut.age = _.map(monthIn.edades, item => [
    item.edad_titulo,
    parseInt(item.nb_registros,10),
  ])

  monthOut.motivation = _.map(monthIn.motivacion, item => [
    item.motivo_titulo,
    parseInt(item.nb_registros,10),
  ])

  monthOut.spanishFrom = _.map(monthIn.autonomias, region => [
    region.autonomia_titulo,
    parseInt(region.nb_registros,10),
  ])
  var totalFromSpain = monthOut.spanishFrom.reduce((prev,curr) => prev+curr[1], 0)

  nonNulls = _.filter(monthIn.paises, country => country.pais_titulo)
  monthOut.byCountry = _.map(nonNulls, country => [
    country.pais_titulo,
    parseInt(country.nb_registros,10),
  ])
  monthOut.byCountry.push(["España", totalFromSpain])

  monthOut.professions = _.map(monthIn.profesiones, item => [
    item.grupo_titulo,
    parseInt(item.nb_registros,10),
  ])

  monthOut.startingCities = _.map(monthIn.procedencia, item => [
    item.procedencia_titulo,
    parseInt(item.nb_registros,10),
  ])
  monthOut.startingRegions = totalByRegion(monthOut.startingCities)

  monthOut.caminos = _.map(monthIn.camino, item => {
    var caminoName = item.camino_titulo
    if (!caminoName) caminoName = 'Otros caminos'
    return [caminoName, parseInt(item.nb_registros,10)]
  })

  sortMonthData(monthOut)

  return monthOut
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var mergeIntoList = function(sourceList, listToMerge) {
  _.forEach(listToMerge, pairToMerge => {
    var indexOfMatch = _.findIndex(sourceList, (sourcePair) => {
      if (sourcePair[0] === pairToMerge[0]) return true
    })
    if (indexOfMatch < 0) {
      sourceList.push([pairToMerge[0],pairToMerge[1]])
    } else {
      sourceList[indexOfMatch][1] += pairToMerge[1]
    }
  })
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var addMonthToData = function(dataIn, newMonth) {
  dataIn.pilgrims += newMonth.pilgrims
  mergeIntoList(dataIn.gender, newMonth.gender)
  mergeIntoList(dataIn.transport, newMonth.transport)
  mergeIntoList(dataIn.age, newMonth.age)
  mergeIntoList(dataIn.motivation, newMonth.motivation)
  mergeIntoList(dataIn.spanishFrom, newMonth.spanishFrom)
  mergeIntoList(dataIn.byCountry, newMonth.byCountry)
  mergeIntoList(dataIn.professions, newMonth.professions)
  mergeIntoList(dataIn.startingCities, newMonth.startingCities)
  mergeIntoList(dataIn.startingRegions, newMonth.startingRegions)
  mergeIntoList(dataIn.caminos, newMonth.caminos)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var processData = function() {
  var allYearsData = {
    year:'9999',
    month:'',
    pilgrims: 0,
    gender: [],
    transport: [],
    age: [],
    motivation: [],
    spanishFrom: [],
    byCountry: [],
    professions: [],
    startingCities: [],
    startingRegions: [],
    caminos: [],
  }
  _.forEach(shared.years, (year) => {
    var yearData = {
      year:year,
      month:'',
      pilgrims: 0,
      gender: [],
      transport: [],
      age: [],
      motivation: [],
      spanishFrom: [],
      byCountry: [],
      professions: [],
      startingCities: [],
      startingRegions: [],
      caminos: [],
    }
    _.forEach(shared.monthsForYear(year), (month) => {
      addMonthToData(yearData, pData[year][month])
    })
    sortMonthData(yearData)
    pData[year]['all'] = yearData
    addMonthToData(allYearsData, yearData)
  })
  sortMonthData(allYearsData)
  pData['2004-2016'] = {'all':allYearsData}
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var readMonthlyData = function() {
  _.forEach(shared.years, function(year) {
    pData[year] = {}
    _.forEach(shared.monthsForYear(year), (month) => {
      let filename = './data.raw/pdj-' + year + '-' + month + '.json'
      ++numStarted
      fs.readFile(filename, (err, dataIn) => {
        if (err) {
          console.log('***** ERROR reading ' + filename)
        } else {
          pData[year][month] = convertOneMonth(JSON.parse(dataIn)[0])
          ++numFinished
          if (numStarted === numFinished) {
            processData()
            writeData()
          }
        }
      })
    })
  })
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
readMonthlyData()

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
function isShortArray(v) { return _.isArray(v) && (v.length < 1000) }
function linearizeStep(sofar, item) {
  if (isShortArray(item)) { item = linearizeArray(item) }
  return (sofar ? (sofar+', ') : '[') + item
}
function linearizeArray(array) {
  return _.reduce(array, linearizeStep, '') + ']'
}
function jsonReplacer(key, value) {
  if (isShortArray(value)) { return linearizeArray(value) }
  return value;
}
//------------------------------------------------------------------------------
var writeOneFile = function(path, data, jsonSpacing, jsonReplacer) {
  var json = JSON.stringify(data, jsonReplacer, jsonSpacing)
  console.log(path + ': ' + (json.length/1000).toFixed() + ' KB');
  fs.writeFile(path, json)
}
//------------------------------------------------------------------------------
var writeData = function() {
  writeOneFile('./data/pData.json', pData, 0, null)
  writeOneFile('./data/pDataHuman.json', pData, 1, jsonReplacer)
  writeOneFile('./data/pData2015Human.json', pData['2015'], 1, jsonReplacer)

  var pDataByYear = {}
  shared.years.forEach((year) => { pDataByYear[year] = pData[year]['all'] })
  writeOneFile('./data/pDataByYearHuman.json', pDataByYear, 1, jsonReplacer)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var sortMonthData = function(monthData) {
  var orderByReverseItem1AsNumber = (a,b) => (b[1]-a[1])
  monthData.spanishFrom.sort(orderByReverseItem1AsNumber)
  monthData.byCountry.sort(orderByReverseItem1AsNumber)
  monthData.professions.sort(orderByReverseItem1AsNumber)
  monthData.startingCities.sort(orderByReverseItem1AsNumber)
  monthData.startingRegions.sort(orderByReverseItem1AsNumber)
  monthData.caminos.sort(orderByReverseItem1AsNumber)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
