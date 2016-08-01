"use strict"
const fs = require('fs');
const filename = './amazonData.txt'
fs.readFile(filename, 'utf8', function(err, data) {
  if (err) {
    console.log('***** ERROR reading ' + filename)
  } else {
    let lines = data.split('\n')
    let linesOut = ''
    console.log(`Read ${lines.length} lines`)
    let bookNumber = 0;
    let bookLine = ''
    let isSample = 'amazon'
    lines.forEach(function(line) {
      if (line.length < 1) return
      if (line.indexOf('...') >= 0) return
      if (line === 'Sample') {
        isSample = 'sample'
        return
      }
      let parts = line.split('---')
      if (parts.length == 1) {
        bookLine = '"' + line + '",'
      } else {
        let author = parts[0]
        let authorParts = author.split(' ')
        let len = authorParts.length
        if (len > 1) {
          author = authorParts[len-1] + ', ' + authorParts.slice(0,len-1).join(' ')
        }
        bookLine += '"' + author + '","' + parts[1] + '",' + isSample
        linesOut += bookLine + '\n'
        isSample = 'amazon'
        //console.log(bookLine)
        ++bookNumber
      }
    })
    fs.writeFile('amazonData.csv', linesOut)
    console.log(`Wrote ${bookNumber} book records`)
  }
})
