"use strict";
console.log('loading fetchData.js')
var LOCAL = {}
LOCAL.pdata = null
LOCAL.promise = $.ajax({
  dataType: "json",
  url: './data/pData.json',
  success: data => {
    console.log('Fetched pdata', data)
    LOCAL.pdata = data
  },
  error: (prom, status, code) => {
    console.log('*********FAILed to fetch pdata '+status+', '+code)
  },
});

var requestShim = {
  "url": null,
  "headers": {
    "user-agent": 'Local call user-agent',
    "origin": 'Local call origin'
  }
}
var responseShim = {
  "writeHead": (a,b) => {},
  "end": (html) => {console.log("Failed to set response.end method")}
}
var module = {
  "exports": null
}
//console.log('**************** fetchData.js: module=', module)
var require = (moduleName) => {
  console.log('REQUIRE: ' + moduleName)
}
//console.log('fetchData.js: require=', require)
