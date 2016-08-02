/*
 * This is run: node combineYears.js
 * It combines the monthly pilgrim data gotten by fetchong JSON from the web site
 * into one big file the the server.js program can read in.
 */
 "use strict";

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
const fs = require('fs')
const shared = require('./shared')
const _ = require('lodash')

var pData = {}
_.forEach(shared.years, year => {pData[year]={}})
var numStarted = 0
var numFinished = 0

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var writeData = () => {
  console.log('Write ./data/pData.json');
  fs.writeFile('./data/pData.json', JSON.stringify(pData, null, 0))

  console.log('Write ./data/pDataHuman.json');
  fs.writeFile('./data/pDataHuman.json', JSON.stringify(pData, null, 2))

  console.log('Write ./data/pData2015Human.json');
  fs.writeFile('./data/pData2015Human.json', JSON.stringify(pData['2015'], null, 2))

  var pDataByYear = {}
  shared.years.forEach((year) => { pDataByYear[year] = pData[year]['all'] })

  console.log('Write ./data/pDataByYearHuman.json');
  fs.writeFile('./data/pDataByYearHuman.json', JSON.stringify(pDataByYear, null, 2))
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var sortMonthData = (monthData) => {
  var orderByReverseItem1AsNumber = (a,b) => (b[1]-a[1])
  monthData.spanishFrom.sort(orderByReverseItem1AsNumber)
  monthData.byCountry.sort(orderByReverseItem1AsNumber)
  monthData.professions.sort(orderByReverseItem1AsNumber)
  monthData.startingPlaces.sort(orderByReverseItem1AsNumber)
  monthData.caminos.sort(orderByReverseItem1AsNumber)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var convertOneMonth = monthIn => {
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

  monthOut.byCountry = _.map(monthIn.paises, item => {
    var country = countrySpanishToEnglish[item.pais_titulo]
    if (!country) country = item.pais_titulo
    return [country, parseInt(item.nb_registros,10)]
  })
  monthOut.byCountry.push(["Spain", totalFromSpain])

  monthOut.professions = _.map(monthIn.profesiones, item => [
    item.grupo_titulo,
    parseInt(item.nb_registros,10),
  ])

  monthOut.startingPlaces = _.map(monthIn.procedencia, item => [
    item.procedencia_titulo,
    parseInt(item.nb_registros,10),
  ])

  monthOut.caminos = _.map(monthIn.camino, item => [
    item.camino_titulo,
    parseInt(item.nb_registros,10),
  ])

  sortMonthData(monthOut)

  return monthOut
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var mergeIntoList = (sourceList, listToMerge) => {
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
var addMonthToData = (dataIn, newMonth) => {
  dataIn.pilgrims += newMonth.pilgrims
  mergeIntoList(dataIn.gender, newMonth.gender)
  mergeIntoList(dataIn.transport, newMonth.transport)
  mergeIntoList(dataIn.age, newMonth.age)
  mergeIntoList(dataIn.motivation, newMonth.motivation)
  mergeIntoList(dataIn.spanishFrom, newMonth.spanishFrom)
  mergeIntoList(dataIn.byCountry, newMonth.byCountry)
  mergeIntoList(dataIn.professions, newMonth.professions)
  mergeIntoList(dataIn.startingPlaces, newMonth.startingPlaces)
  mergeIntoList(dataIn.caminos, newMonth.caminos)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var processData = () => {
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
      startingPlaces: [],
      caminos: [],
    }
    _.forEach(shared.months, (month) => {
      addMonthToData(yearData, pData[year][month])
    })
    sortMonthData(yearData)
    pData[year]['all'] = yearData
  })
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var readMonthlyData = () => {
  _.forEach(shared.years, (year) => {
    pData[year] = {}
    //pData2[year] = {}
    _.forEach(shared.months, (month) => {
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

var countrySpanishToEnglish = {
  "Alemania":"Germany",
  "Andorra":"Andorra",
  "Angola":"Angola",
  "Armenia":"Armenia",
  "Argentina":"Argentina",
  "Austria":"Austria",
  "Australia":"Australia",
  "Belgica":"Belgium",
  "Bielorrusia":"Belarus",
  "Bolivia":"Bolivia",
  "Brasil":"Brazil",
  "Canadá":"Canada",
  "Chile":"Chile",
  "China":"China",
  "Chipre":"Cyprus",
  "Colombia":"Colombia",
  "Corea":"Korea",
  "Costa Rica":"Costa Rica",
  "Cuba":"Cuba",
  "Dinamarca":"Denmark",
  "Ecuador":"Ecuador",
  "El Salvador":"El Salvador",
  "Espana":"Spain",
  "Eslovaquia":"Slovakia",
  "Estados Unidos":"USA",
  "Filipinas":"Philippines",
  "Finlandia":"Finland",
  "Francia":"France",
  "Grecia":"Greece",
  "Guatemala":"Guatemala",
  "Holanda":"Holland",
  "Hungría":"Hungary",
  "India":"India",
  "Indonesia":"Indonesia",
  "Israel":"Israel",
  "Islandia":"Iceland",
  "Irlanda":"Ireland",
  "Italia":"Italy",
  "Japón":"Japan",
  "Letonia":"Latvia",
  "Líbano":"Lebanon",
  "Lituania":"Lithuania",
  "Luxemburgo":"Luxemburg",
  "Malasia":"Malaysia",
  "México":"Mexico",
  "Moldavia":"Moldavia",
  "Noruega":"Norway",
  "Nueva Zelanda":"New Zealand",
  "Paraguay":"Paraguay",
  "Perú":"Peru",
  "Polonia":"Poland",
  "Portugal":"Portugal",
  "Puerto Rico":"Puerto Rico",
  "Reino Unido":"UK",
  "Rep. Dominicana":"Dom. Rep.",
  "República Checa":"Czech",
  "Rusia":"Russia",
  "Rumania":"Roumania",
  "Singapur":"Singapore",
  "Sudáfrica":"S. Africa",
  "Suecia":"Sweden",
  "Suiza":"Swiss",
  "Taiwán":"Taiwan",
  "Turquía":"Turkey",
  "Ucrania":"Ukraine",
  "Uruguay":"Uruguay",
  "Venezuela":"Venezuela",
}
