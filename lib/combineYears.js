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
  //console.log('byRegion', byRegion)
  return byRegion
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

  monthOut.startingCities = _.map(monthIn.procedencia, item => [
    item.procedencia_titulo,
    parseInt(item.nb_registros,10),
  ])
  monthOut.startingRegions = totalByRegion(monthOut.startingCities)

  monthOut.caminos = _.map(monthIn.camino, item => {
    var caminoName = item.camino_titulo
    if (!caminoName) caminoName = 'Other'
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
  })
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var readMonthlyData = () => {
  _.forEach(shared.years, (year) => {
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
  monthData.startingCities.sort(orderByReverseItem1AsNumber)
  monthData.startingRegions.sort(orderByReverseItem1AsNumber)
  monthData.caminos.sort(orderByReverseItem1AsNumber)
}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
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

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
var cityMap = {
  'Sarria': {region:'Sarria'},
  'S. Jean P. Port': {region:'St. Jean'},
  'Tui': {region:'Ponte- vedra'},
  'Oporto': {region:'Port- ugal'},
  'León': {region:'León'},
  'Cebreiro': {region:'Lugo - Sarria'},
  'Ferrol': {region:'A Coruña'},
  'Ponferrada': {region:'León'},
  'Roncesvalles': {region:'Navarra'},
  'Oviedo - C.P.': {region:'Asturias'},
  'Astorga': {region:'León'},
  'Valença do Minho': {region:'Port- ugal'},
  'Pamplona': {region:'Navarra'},
  'Irún': {region:'Gipuzkoa'},
  'Burgos': {region:'Burgos'},
  'Le Puy': {region:'France - St. Jean'},
  'Lugo - C.P.': {region:'Lugo - Sarria'},
  'Ourense': {region:'Ourense'},
  'Vilafranca': {region:'Other'},
  'Sevilla': {region:'Sevilla'},
  'Triacastela': {region:'Lugo - Sarria'},
  'Francia - C.F.': {region:'France - St. Jean'},
  'Resto Portugal': {region:'Port- ugal'},
  'Lisboa': {region:'Port- ugal'},
  'Resto Asturias - C.N': {region:'Asturias'},
  'Ponte de Lima': {region:'Port- ugal'},
  'Samos': {region:'Lugo - Sarria'},
  'Resto C. León C.F.': {region:'León'},
  'Ribadeo': {region:'Lugo - Sarria'},
  'Bilbao': {region:'Vizcaya'},
  'Santander': {region:'Cantabria'},
  'Vilalba': {region:'Lugo - Sarria'},
  'Gijón': {region:'Asturias'},
  'Logroño': {region:'La Rioja'},
  'Rates': {region:'Port- ugal'},
  'S. Pedro': {region:'Málaga'},
  'San Sebastián': {region:'Gipuzkoa'},
  'Barcelos': {region:'Port- ugal'},
  'Alemania': {region:'Germany'},
  'Fonsagrada - C.P.': {region:'Lugo - Sarria'},
  'Holanda': {region:'Holland'},
  'Salamanca': {region:'Salamanca'},
  'Avilés': {region:'Asturias'},
  'Neda': {region:'A Coruña'},
  'Somport': {region:'France - St. Jean'},
  'Resto Asturias - C.P.': {region:'Asturias'},
  'Madrid - C.F.': {region:'Madrid'},
  'Braga': {region:'Port- ugal'},
  'Porriño': {region:'Ponte- vedra'},
  'Mondoñedo': {region:'Lugo - Sarria'},
  'Puebla de Sanabria': {region:'Zamora'},
  'Oviedo - C.N.': {region:'Asturias'},
  'Vigo': {region:'Ponte- vedra'},
  'Zamora': {region:'Zamora'},
  'Resto Europa': {region:'Europe Other'},
  'Muxia': {region:'A Coruña'},
  'Sahagún': {region:'León'},
  'Resto País Vasco - C.N.': {region:'Other'},
  'Baiona': {region:'Ponte- vedra'},
  'Finisterra': {region:'A Coruña'},
  'Baamonde': {region:'Lugo - Sarria'},
  'Grandas de Salime - C.P.': {region:'Asturias'},
  'Lourdes': {region:'France - St. Jean'},
  'Chaves-Portugal': {region:'Port- ugal'},
  'Abadin': {region:'Lugo - Sarria'},
  'Guimaraes': {region:'Port- ugal'},
  'Bélgica': {region:'Belgium'},
  'Francia - C.N': {region:'France - St. Jean'},
  'Resto Cantabria': {region:'Cantabria'},
  'Suiza': {region:'Switzerland'},
  'A Guarda': {region:'Ponte- vedra'},
  'Coimbra': {region:'Port- ugal'},
  'Resto Andalucia': {region:'Other'},
  'Resto C. León - V.P.': {region:'León'},
  'Viana do Castelo': {region:'Port- ugal'},
  'Hendaya': {region:'France - St. Jean'},
  'Vezelay': {region:'France - St. Jean'},
  'Cruz de Ferro': {region:'León'},
  'Gudiña': {region:'Ourense'},
  'Frómista': {region:'Palencia'},
  'Arles': {region:'France - St. Jean'},
  'Cadavo': {region:'Lugo - Sarria'},
  'Laza': {region:'Ourense'},
  'Fatima': {region:'Port- ugal'},
  'Granja de Moreruela': {region:'Zamora'},
  'Vega de Valcarce': {region:'León'},
  'Xunqueira de Ambia': {region:'Ourense'},
  'Allariz': {region:'Ourense'},
  'Cataluña - C.F.': {region:'Other'},
  'Sto. Domingo de la Calzada': {region:'La Rioja'},
  'Lourenzá': {region:'Lugo - Sarria'},
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
  'París': {region:'France - St. Jean'},
  'Resto de Extremadura': {region:'Other'},
  'Valencia O.C.': {region:'Valencia'},
  'Com. Valenciana - C.F.': {region:'Valencia'},
  'Povoa de Varzim': {region:'Port- ugal'},
  'Castrojeriz': {region:'Burgos'},
  'Granada': {region:'Granada'},
  'Estella': {region:'Navarra'},
  'R.Pais Vasco C.F.': {region:'Other'},
  'Navarra': {region:'Navarra'},
  'Salas': {region:'Asturias'},
  'Verín': {region:'Ourense'},
  'Austria': {region:'Austria'},
  'Italia': {region:'Italy'},
  'Malaga': {region:'Málaga'},
  'Esposende': {region:'Ourense'},
  'Molinaseca': {region:'León'},
  'Cast. la Mancha - C.F.': {region:'Albacete'},
  'Viseu': {region:'Port- ugal'},
  'Vilabade': {region:'Lugo - Sarria'},
  'Castilla La Mancha VP': {region:'Albacete'},
  'Canfranc': {region:'Huesca'},
  'Monforte de Lemos': {region:'Lugo - Sarria'},
  'Castilla la Mancha otros': {region:'Albacete'},
  'Polonia': {region:'Poland'},
  'Valladolid': {region:'Valladolid'},
  'Huelva': {region:'Huelva'},
  'Nájera': {region:'La Rioja'},
  'Faro': {region:'Port- ugal'},
  'Grado': {region:'Asturias'},
  'Córdoba': {region:'Córdoba'},
  'Cataluña - O.C.': {region:'Other'},
  'Badajoz': {region:'Badajoz'},
  'Roma': {region:'Italy'},
  'Resto Galicia': {region:'Other'},
  'Chantada': {region:'Lugo - Sarria'},
  'La Mesa': {region:'Asturias'},
  'Reino Unido C.F.': {region:'UK'},
  'La Rioja': {region:'La Rioja'},
  'Benavente': {region:'Zamora'},
  'Aveiro': {region:'Port- ugal'},
  'San Juan de Ortega': {region:'Burgos'},
  'Republica Checa': {region:'Czech Republic'},
  'Murcia': {region:'Murcia'},
  'Fonfría': {region:'Lugo - Sarria'},
  'Quiroga': {region:'Lugo - Sarria'},
  'Dinamarca': {region:'Denmark'},
  'A Rúa': {region:'Ourense'},
  'Luxemburgo': {region:'Luxembourg'},
  'O Barco de Valdeorras': {region:'Ourense'},
  'Eslovaquia': {region:'Slovakia'},
  'Vegadeo': {region:'Asturias'},
  'Ortigueira': {region:'A Coruña'},
  'Hungría': {region:'Hungary'},
  'Sobrado': {region:'Other'},
  'Guntín': {region:'A Coruña'},
  'Valcarlos': {region:'Navarra'},
  'Leyre': {region:'Navarra'},
  'Borres': {region:'Asturias'},
  'Andorra': {region:'Andorra'},
  'Irlanda C.F.': {region:'Ireland'},
  'Puente de Domingo Flórez': {region:'León'},
  'Betanzos': {region:'A Coruña'},
  'Lalín': {region:'Ponte- vedra'},
  'La Bañeza': {region:'León'},
  'Reino Unido C.Ing': {region:'UK'},
  'Rusia': {region:'Russia'},
  'Las Médulas': {region:'León'},
  'mirallos': {region:'Lugo - Sarria'},
  'Vincios': {region:'Ponte- vedra'},
  'Pontedeume': {region:'A Coruña'},
  'Inglaterra C.F.': {region:'UK'},
  'Covelo': {region:'Ponte- vedra'},
  'Irlanda C. Ing': {region:'Ireland'},
  'Viveiro': {region:'Lugo - Sarria'},
  'Gándara': {region:'Ponte- vedra'},
  'Artieda': {region:'Zaragoza'},
  'Paradela': {region:'Lugo - Sarria'},
  'Finlandia': {region:'Finland'},
  'Peñaseita': {region:'Asturias'},
  'Pardellas': {region:'Other'},
  'Sobrado dos Monxes': {region:'Other'},
  'Petín': {region:'Other'},
  'Rábade': {region:'Other'},
  'XFonsagrada': {region:'Other'},
  'XSan Sebastian': {region:'Other'},
  'XGrandas de Salime': {region:'Other'},
  'Resto Africa': {region:'Other'},
  'XLa Rioja': {region:'Other'},
  'XTineo': {region:'Other'},
  'Guitiriz': {region:'Other'},
  'Ventas de Narón': {region:'Other'},
  'Jerusalem': {region:'Other'},
  'Corredoiras': {region:'Other'},
  'Cea': {region:'Other'},
  'Gonzar': {region:'Other'},
  'Grecia': {region:'Other'},
  'Mella': {region:'Other'},
  'Resto Asturias': {region:'Other'},
  'Oviedo': {region:'Other'},
  'Resto C. León': {region:'Other'},
  'Egipto': {region:'Other'},
  'Francia': {region:'Other'},
  'Resto País Vasco': {region:'Other'},
  'Cataluña': {region:'Other'},
  'Fonsagrada': {region:'Other'},
  'Madrid': {region:'Other'},
  'Com. Valenciana': {region:'Other'},
  'Valencia': {region:'Other'},
  'R.Pais Vasco': {region:'Other'},
  'Grandas de Salime': {region:'Other'},
  'Castilla la Mancha': {region:'Other'},
  'Tineo': {region:'Other'},
  'Castilla La Mancha': {region:'Other'},
  'Cast. la Mancha': {region:'Other'},
  'San Sebastian': {region:'Other'},
  'Reino Unido': {region:'Other'},
  'Irlanda': {region:'Other'},
  'El Escamplero': {region:'Other'},
  'Inglaterra': {region:'Other'},
  'Silleda': {region:'Other'},
}
