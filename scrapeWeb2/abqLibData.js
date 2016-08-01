"use strict"
const fs = require('fs');
const filename = './abqLibData.txt'
fs.readFile(filename, 'utf8', function(err, data) {
  if (err) {
    console.log('***** ERROR reading ' + filename)
  } else {
    let linesIn = data.split('\n')
    let linesOut = ''
    console.log(`Read ${linesIn.length} lines`)

    let bookNumber = 0;
    let bookLine = ''
    let title = ''
    let author = ''
    let date = ''
    let inTitle = false
    let imprint = ''
    let inImprint = false
    /*
    Record 215 of 1866
    AUTHOR       Twitchell, James B., 1943-
    TITLE        Shopping for God : how Christianity went from in your heart to in
                   your face / James B. Twitchell.
    IMPRINT      New York : Simon & Schuster, 2007.
    CALL #       254.4 Twitchell.
    */
    linesIn.forEach(function(line) {
      // Skip blank lines
      if (line.length < 1) return
      let splitLine = null

      // Switch on the first word of the line
      var parts = line.split(' ')
      switch (parts[0]) {
        case 'Record':
        break;

        case 'CALL':
        inImprint = false
        // Remove unused parts from the title
        title = title.replace(' [sound recording (CD)]', '')
        splitLine = title.split(' / ')
        title = splitLine[0]

        // Get date without non-digits
        splitLine = imprint.split(' ')
        date = splitLine[splitLine.length-1].replace(/[^\d]/g, '')

        bookLine = `"${title}","${author}","1/1/${date}",abqLib`
        //console.log(bookLine)
        linesOut += bookLine + '\n'
        ++bookNumber
        break;

        case 'IMPRINT':
        inTitle = false
        imprint = line
        inImprint = true
        break;

        case 'AUTHOR':
        author = parts.slice(1).join(' ').trim()
        break;

        case 'TITLE':
        title = parts.slice(1).join(' ').trim()
        inTitle = true
        break;

        default:
        if (inTitle) {
          // Add line to title
          title += ' ' + line.trim()
        } else if (inImprint) {
          imprint += ' ' + line.trim()
        } else {
          console.log(`***ERROR: unknown keyword in ${line}`)
        }
      }
    })
    fs.writeFile('abqLibData.csv', linesOut)
    console.log(`Wrote ${bookNumber} book records`)
  }
})
