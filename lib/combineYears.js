/*
 * This is run: node combineYears.js
 * It combines the monthly pilgrim data gotten by fetchong JSON from the web site
 * into one big file the the server.js program can read in.
 */
 "use strict";

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
const fs = require('fs')
const _ = require('lodash')

var years = ['2016', '2015', '2014', '2013', '2012', '2011', '2010',
'2009', '2008', '2007', '2006', '2005', '2004']
var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
var monthsForYear = year => {
  if (year === '2016') return months.slice(0,7)
  return months
}

var pData = {}
_.forEach(years, year => {pData[year]={}})
var numStarted = 0
var numFinished = 0

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var totalByRegion = (byCity) => {
  var byRegion = []
  _.forEach(byCity, cityPair => {
    var region = cityMap[cityPair[0]]
    var regionName = 'ERROR'
    if (region) regionName = region.region
    else regionName = 'Other'
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
var convertOneMonth = monthIn => {
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
  mergeIntoList(dataIn.startingCities, newMonth.startingCities)
  mergeIntoList(dataIn.startingRegions, newMonth.startingRegions)
  mergeIntoList(dataIn.caminos, newMonth.caminos)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var processData = () => {
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
  _.forEach(years, (year) => {
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
    _.forEach(monthsForYear(year), (month) => {
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
var readMonthlyData = () => {
  _.forEach(years, (year) => {
    pData[year] = {}
    _.forEach(monthsForYear(year), (month) => {
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
var writeData = () => {
  console.log('Write ./data/pData.json');
  fs.writeFile('./data/pData.json', JSON.stringify(pData, null, 0))

  console.log('Write ./data/pDataHuman.json');
  fs.writeFile('./data/pDataHuman.json', JSON.stringify(pData, null, 2))

  console.log('Write ./data/pData2015Human.json');
  fs.writeFile('./data/pData2015Human.json', JSON.stringify(pData['2015'], null, 2))

  var pDataByYear = {}
  years.forEach((year) => { pDataByYear[year] = pData[year]['all'] })

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
  monthData.startingCities.sort(orderByReverseItem1AsNumber)
  monthData.startingRegions.sort(orderByReverseItem1AsNumber)
  monthData.caminos.sort(orderByReverseItem1AsNumber)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var cityMap = {
  'Sarria': {region:'Lugo'},
  'S. Jean P. Port': {region:'France'},
  'Tui': {region:'Pontevedra'},
  'Oporto': {region:'Portugal'},
  'León': {region:'León'},
  'Cebreiro': {region:'Lugo'},
  'Ferrol': {region:'A Coruña'},
  'Ponferrada': {region:'León'},
  'Roncesvalles': {region:'Navarra'},
  'Oviedo - C.P.': {region:'Asturias'},
  'Astorga': {region:'León'},
  'Valença do Minho': {region:'Portugal'},
  'Pamplona': {region:'Navarra'},
  'Irún': {region:'Gipuzkoa'},
  'Burgos': {region:'Burgos'},
  'Le Puy': {region:'France'},
  'Lugo - C.P.': {region:'Lugo'},
  'Ourense': {region:'Ourense'},
  'Vilafranca': {region:'León'},
  'Sevilla': {region:'Sevilla'},
  'Triacastela': {region:'Lugo'},
  'Francia - C.F.': {region:'France'},
  'Resto Portugal': {region:'Portugal'},
  'Lisboa': {region:'Portugal'},
  'Resto Asturias - C.N': {region:'Asturias'},
  'Ponte de Lima': {region:'Portugal'},
  'Samos': {region:'Lugo'},
  'Resto C. León C.F.': {region:'León`'},
  'Ribadeo': {region:'Lugo'},
  'Bilbao': {region:'Vizcaya'},
  'Santander': {region:'Cantabria'},
  'Vilalba': {region:'Lugo'},
  'Gijón': {region:'Asturias'},
  'Logroño': {region:'La Rioja'},
  'Rates': {region:'Portugal'},
  'S. Pedro': {region:'Málaga'},
  'San Sebastián': {region:'Gipuzkoa'},
  'Barcelos': {region:'Portugal'},
  'Alemania': {region:'Germany'},
  'Fonsagrada - C.P.': {region:'Lugo'},
  'Holanda': {region:'Holland'},
  'Salamanca': {region:'Salamanca'},
  'Avilés': {region:'Asturias'},
  'Neda': {region:'A Coruña'},
  'Somport': {region:'France'},
  'Resto Asturias - C.P.': {region:'Asturias'},
  'Madrid - C.F.': {region:'Madrid'},
  'Braga': {region:'Portugal'},
  'Porriño': {region:'Pontevedra'},
  'Mondoñedo': {region:'Lugo'},
  'Puebla de Sanabria': {region:'Zamora'},
  'Oviedo - C.N.': {region:'Asturias'},
  'Vigo': {region:'Pontevedra'},
  'Zamora': {region:'Zamora'},
  'Resto Europa': {region:'Europe Other'},
  'Muxia': {region:'A Coruña'},
  'Sahagún': {region:'León'},
  'Resto País Vasco - C.N.': {region:'Gipuzkoa'},
  'Baiona': {region:'Pontevedra'},
  'Finisterra': {region:'A Coruña'},
  'Baamonde': {region:'Lugo'},
  'Grandas de Salime - C.P.': {region:'Asturias'},
  'Lourdes': {region:'France'},
  'Chaves-Portugal': {region:'Porgugal'},
  'Abadin': {region:'Lugo'},
  'Guimaraes': {region:'Portugal'},
  'Bélgica': {region:'Belgium'},
  'Francia - C.N': {region:'France'},
  'Resto Cantabria': {region:'Cantabria'},
  'Suiza': {region:'Switzerland'},
  'A Guarda': {region:'Pontevedra'},
  'Coimbra': {region:'Portugal'},
  'Resto Andalucia': {region:'Sevilla'},
  'Resto C. León - V.P.': {region:'León'},
  'Viana do Castelo': {region:'Portugal'},
  'Hendaya': {region:'France'},
  'Vezelay': {region:'France'},
  'Cruz de Ferro': {region:'León'},
  'Gudiña': {region:'Ourense'},
  'Frómista': {region:'Palencia'},
  'Arles': {region:'France'},
  'Cadavo': {region:'Lugo'},
  'Laza': {region:'Ourense'},
  'Fatima': {region:'Portugal'},
  'Granja de Moreruela': {region:'Zamora'},
  'Vega de Valcarce': {region:'León'},
  'Xunqueira de Ambia': {region:'Ourense'},
  'Allariz': {region:'Ourense'},
  'Cataluña - C.F.': {region:'Barcelona'},
  'Sto. Domingo de la Calzada': {region:'La Rioja'},
  'Lourenzá': {region:'Lugo'},
  'Carrión de los Condes': {region:'Palencia'},
  'Tineo - C.P.': {region:'Asturias'},
  'Hospital de Orbigo': {region:'León'},
  'Rabanal del Camino': {region:'León'},
  'Jaca': {region:'Huesca'},
  'Puente la Reina': {region:'Navarra'},
  'Com. Valenciana - O.C.': {region:'Valencia'},
  'Barcelona': {region:'Barcelona'},
  'Mérida': {region:'Badajoz'},
  'Cáceres': {region:'Cáceres'},
  'Zaragoza': {region:'Zaragoza'},
  'Ponferrada. C.Inv.': {region:'León'},
  'Montserrat': {region:'Barcelona'},
  'Madrid - V.P.': {region:'Madrid'},
  'París': {region:'France'},
  'Resto de Extremadura': {region:'Badajoz'},
  'Valencia O.C.': {region:'Valencia'},
  'Com. Valenciana - C.F.': {region:'Valencia'},
  'Povoa de Varzim': {region:'Portugal'},
  'Castrojeriz': {region:'Burgos'},
  'Granada': {region:'Granada'},
  'Estella': {region:'Navarra'},
  'R.Pais Vasco C.F.': {region:'Gipuzkoa'},
  'Navarra': {region:'Navarra'},
  'Salas': {region:'Asturias'},
  'Verín': {region:'Ourense'},
  'Austria': {region:'Austria'},
  'Italia': {region:'Italy'},
  'Malaga': {region:'Málaga'},
  'Esposende': {region:'Ourense'},
  'Molinaseca': {region:'León'},
  'Cast. la Mancha - C.F.': {region:'Albacete'},
  'Viseu': {region:'Portugal'},
  'Vilabade': {region:'Lugo'},
  'Castilla La Mancha VP': {region:'Albacete'},
  'Canfranc': {region:'Huesca'},
  'Monforte de Lemos': {region:'Lugo'},
  'Castilla la Mancha otros': {region:'Albacete'},
  'Polonia': {region:'Poland'},
  'Valladolid': {region:'Valladolid'},
  'Huelva': {region:'Huelva'},
  'Nájera': {region:'La Rioja'},
  'Faro': {region:'Portugal'},
  'Grado': {region:'Asturias'},
  'Córdoba': {region:'Córdoba'},
  'Cataluña - O.C.': {region:'Barcelona'},
  'Badajoz': {region:'Badajoz'},
  'Roma': {region:'Italy'},
  'Resto Galicia': {region:'A Coruña'},
  'Chantada': {region:'Lugo'},
  'La Mesa': {region:'Asturias'},
  'Reino Unido C.F.': {region:'UK'},
  'La Rioja': {region:'La Rioja'},
  'Benavente': {region:'Zamora'},
  'Aveiro': {region:'Portugal'},
  'San Juan de Ortega': {region:'Burgos'},
  'Republica Checa': {region:'Czech Republic'},
  'Murcia': {region:'Murcia'},
  'Fonfría': {region:'Lugo'},
  'Quiroga': {region:'Lugo'},
  '': {region:'Other'},
  'Dinamarca': {region:'Denmark'},
  'A Rúa': {region:'Ourense'},
  'Luxemburgo': {region:'Luxembourg'},
  'O Barco de Valdeorras': {region:'Ourense'},
  'Eslovaquia': {region:'Slovakia'},
  'Vegadeo': {region:'Asturias'},
  'Ortigueira': {region:'A Coruña'},
  'Hungría': {region:'Hungary'},
  'Sobrado': {region:'A Coruña'},
  'Guntín': {region:'A Coruña'},
  'Valcarlos': {region:'Navarra'},
  'Leyre': {region:'Navarra'},
  'Borres': {region:'Asturias'},
  'Andorra': {region:'Andorra'},
  'Irlanda C.F.': {region:'Ireland'},
  'Puente de Domingo Flórez': {region:'León'},
  'Betanzos': {region:'A Coruña'},
  'Lalín': {region:'Pontevedra'},
  'La Bañeza': {region:'León'},
  'Reino Unido C.Ing': {region:'UK'},
  'Rusia': {region:'Russia'},
  'Las Médulas': {region:'León'},
  'mirallos': {region:'Lugo'},
  'Vincios': {region:'Pontevedra'},
  'Pontedeume': {region:'A Coruña'},
  'Inglaterra C.F.': {region:'UK'},
  'Covelo': {region:'Pontevedra'},
  'Irlanda C. Ing': {region:'Ireland'},
  'Viveiro': {region:'Lugo'},
  'Gándara': {region:'Pontevedra'},
  'Artieda': {region:'Zaragoza'},
  'Paradela': {region:'Lugo'},
  'Finlandia': {region:'Finland'},
  'Peñaseita': {region:'Asturias'},
  'Pardellas': {region:'Pontevedra'},
  'Sobrado dos Monxes': {region:'A Coruña'},
  'Petín': {region:'Ourense'},
  'Rábade': {region:'Huelva'},
  'XFonsagrada': {region:'Lugo'},
  'XSan Sebastian': {region:'Gipuzkoa'},
  'XGrandas de Salime': {region:'Asturias'},
  'Resto Africa': {region:'Africa'},
  'XLa Rioja': {region:'La Rioja'},
  'XTineo': {region:'Asturias'},
  'Guitiriz': {region:'Lugo'},
  'Ventas de Narón': {region:'Lugo'},
  'Jerusalem': {region:'Israel'},
  'Corredoiras': {region:'A Coruña'},
  'Cea': {region:'León'},
  'Gonzar': {region:'Lugo'},
  'Grecia': {region:'Greece'},
  'Resto Asturias': {region:'Asturias'},
  'Oviedo': {region:'Asturias'},
  'Resto C. León': {region:'León'},
  'Egipto': {region:'Egypt'},
  'Francia': {region:'France'},
  'Resto País Vasco': {region:'Gipuzkoa'},
  'Cataluña': {region:'Barcelona'},
  'Fonsagrada': {region:'Lugo'},
  'Madrid': {region:'Madrid'},
  'Com. Valenciana': {region:'Valencia'},
  'Valencia': {region:'Valencia'},
  'R.Pais Vasco': {region:'Gipuzkoa'},
  'Grandas de Salime': {region:'Asturias'},
  'Castilla la Mancha': {region:'Albacete'},
  'Tineo': {region:'Asturias'},
  'Castilla La Mancha': {region:'Albacete'},
  'Cast. la Mancha': {region:'Albacete'},
  'San Sebastian': {region:'Gipuzkoa'},
  'Reino Unido': {region:'UK'},
  'Irlanda': {region:'Ireland'},
  'El Escamplero': {region:'Asturias'},
  'Inglaterra': {region:'UK'},
  'Silleda': {region:'Pontevedra'},
}
